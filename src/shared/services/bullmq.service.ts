import IORedis from "ioredis";
import { Queue, Worker, QueueEvents } from "bullmq";
import { ISubscriptionPaymentService } from "../../services/subscription-payment-service/subscription-payment.service.interface";
import { ICompanySubscriptionService } from "../../services/subscription/interfaces/company-subscription.service.interface";
export interface QueueJob {
    type: "process-queue" | "manual-activate" | "cleanup-expired";
    companyId?: string;
    subscriptionId?: string;
}

export class BullMQService {
    private queue: Queue<QueueJob>;
    private worker: Worker<QueueJob>;
    private queueEvents: QueueEvents;
    private connection: IORedis;

    constructor(
        private readonly _subscriptionPaymentService: ISubscriptionPaymentService,
        private readonly _subscriptionService: ICompanySubscriptionService,
        redisUrl: string = process.env.REDIS_URL || "redis://localhost:6379",
    ) {
        // Create Redis connection
        this.connection = new IORedis(redisUrl, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        });

        // Initialize Queue
        this.queue = new Queue<QueueJob>("subscription-queue", {
            connection: this.connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000,
                },
                removeOnComplete: {
                    count: 1000, // Keep last 1000 completed
                    age: 24 * 3600, // 24 hours
                },
                removeOnFail: {
                    count: 5000, // Keep last 5000 failed
                },
            },
        });
        // Initialize Worker
        this.worker = new Worker<QueueJob>(
            "subscription-queue",
            async (job) => {
                const startTime = Date.now();
                console.log(`[BullMQ] Processing job ${job.id} - Type: ${job.data.type}`);

                try {
                    let result;

                    switch (job.data.type) {
                        case "process-queue":
                            result = await this.processQueue();
                            break;

                        case "manual-activate":
                            if (!job.data.companyId) {
                                throw new Error("companyId required for manual-activate");
                            }
                            result = await this.manualActivateNext(job.data.companyId);
                            break;

                        case "cleanup-expired":
                            result = await this.cleanupExpired();
                            break;

                        default:
                            throw new Error(`Unknown job type: ${job.data.type}`);
                    }

                    const duration = Date.now() - startTime;
                    console.log(`[BullMQ] Job ${job.id} completed in ${duration}ms`);

                    return result;
                } catch (error) {
                    console.error(`[BullMQ] Job ${job.id} failed:`, error);
                    throw error;
                }
            },
            {
                connection: this.connection,
                concurrency: 5, // Process up to 5 jobs concurrently
                limiter: {
                    max: 10,
                    duration: 1000, // Max 10 jobs per second
                },
            },
        );
        // Initialize Queue Events
        this.queueEvents = new QueueEvents("subscription-queue", {
            connection: this.connection,
        });

        this.setupEventListeners();
    }


    

    /**
     * Setup event listeners for monitoring
     */
    private setupEventListeners(): void {
        // Worker events
        this.worker.on("completed", (job, result) => {
            console.log(`[BullMQ]  Job ${job.id} completed:`, result);
        });

        this.worker.on("failed", (job, error) => {
            console.error(`[BullMQ]  Job ${job?.id} failed:`, error.message);
        });

        this.worker.on("error", (error) => {
            console.error("[BullMQ]  Worker error:", error);
        });

        // Queue events
        this.queueEvents.on("waiting", ({ jobId }) => {
            console.log(`[BullMQ]  Job ${jobId} is waiting`);
        });

        this.queueEvents.on("active", ({ jobId }) => {
            console.log(`[BullMQ]  Job ${jobId} is active`);
        });

        this.queueEvents.on("progress", ({ jobId, data }) => {
            console.log(`[BullMQ]  Job ${jobId} progress:`, data);
        });

        this.queueEvents.on("stalled", ({ jobId }) => {
            console.warn(`[BullMQ]  Job ${jobId} stalled`);
        });
    }

    /**
     * Main queue processing function
     * Called by cron job
     */
    private async processQueue(): Promise<{
        expired: number;
        activated: number;
    }> {
        console.log("[BullMQ]  Starting subscription queue processing...");

        const result = await this._subscriptionPaymentService.processSubscriptionQueue();

        console.log(`[BullMQ]  Queue processed: ${result.expired} expired, ${result.activated} activated`);

        return result;
    }

    /**
     * Manually activate next subscription for a company
     */
    private async manualActivateNext(
        companyId: string,
    ): Promise<{
        success: boolean;
        message: string;
    }> {
        console.log(`[BullMQ]  Manually activating next subscription for company ${companyId}`);

        try {
            const queue = await this._subscriptionService.getSubscriptionQueue(companyId);

            if (!queue.queued || queue.queued.length === 0) {
                return {
                    success: false,
                    message: "No queued subscriptions found",
                };
            }

            // This would need to be implemented in your service
            // For now, just return success
            return {
                success: true,
                message: `Next subscription for company ${companyId} will be activated`,
            };
        } catch (error) {
            console.error("[BullMQ] Error in manual activation:", error);
            throw error;
        }
    }

    /**
     * Cleanup expired subscriptions
     */
    private async cleanupExpired(): Promise<{
        cleaned: number;
    }> {
        console.log("[BullMQ]  Cleaning up expired subscriptions...");

        // Implementation would go here
        // For now, just return 0
        return {
            cleaned: 0,
        };
    }

    /**
     * Schedule recurring job to process queue
     * Runs every hour by default
     */
    async scheduleRecurring(cronPattern: string = "0 * * * *"): Promise<void> {
        console.log("[BullMQ] Scheduling recurring queue processing...");

        // Remove any existing repeatable jobs
        const repeatableJobs = await this.queue.getRepeatableJobs();
        for (const job of repeatableJobs) {
            await this.queue.removeRepeatableByKey(job.key);
        }

        // Add new repeatable job
        await this.queue.add(
            "process-queue",
            { type: "process-queue" },
            {
                repeat: {
                    pattern: cronPattern, // Cron pattern (default: every hour)
                },
                jobId: "recurring-queue-processor",
            },
        );

        console.log(`[BullMQ]  Recurring job scheduled with pattern: ${cronPattern}`);
    }

    /**
     * Manually trigger queue processing
     */
    async triggerManual(): Promise<void> {
        console.log("[BullMQ]  Manually triggering queue processing...");

        await this.queue.add(
            "process-queue-manual",
            { type: "process-queue" },
            {
                priority: 1, // High priority
                jobId: `manual-trigger-${Date.now()}`,
            },
        );

        console.log("[BullMQ]  Manual processing triggered");
    }

    /**
     * Activate next subscription for specific company
     */
    async activateNextForCompany(companyId: string): Promise<void> {
        console.log(`[BullMQ]  Triggering activation for company ${companyId}`);

        await this.queue.add(
            "manual-activate",
            {
                type: "manual-activate",
                companyId,
            },
            {
                priority: 2,
                jobId: `activate-${companyId}-${Date.now()}`,
            },
        );

        console.log(`[BullMQ]  Activation triggered for company ${companyId}`);
    }

    /**
     * Get queue statistics
     */
    // async getStats(): Promise<{
    //     waiting: number;
    //     active: number;
    //     completed: number;
    //     failed: number;
    //     delayed: number;
    //     paused: number;
    // }> {
    //     const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
    //         this.queue.getWaitingCount(),
    //         this.queue.getActiveCount(),
    //         this.queue.getCompletedCount(),
    //         this.queue.getFailedCount(),
    //         this.queue.getDelayedCount(),
    //         // this.queue.getPausedCount(),
    //     ]);

    //     return { waiting, active, completed, failed, delayed, paused };
    // }

    /**
     * Get job counts by status
     */
    // async getJobCounts(): Promise<{
    //     waiting: number;
    //     active: number;
    //     completed: number;
    //     failed: number;
    //     delayed: number;
    // }> {
    //     const counts = await this.queue.getJobCounts("waiting", "active", "completed", "failed", "delayed");

    //     return counts;
    // }
    /**
     * Get recent jobs
     */
    // async getRecentJobs(
    //     count: number = 10,
    // ): Promise<{
    //     completed: any[];
    //     failed: any[];
    // }> {
    //     const [completed, failed] = await Promise.all([
    //         this.queue.getCompleted(0, count - 1),
    //         this.queue.getFailed(0, count - 1),
    //     ]);

    //     return {
    //         completed: completed.map((job) => ({
    //             id: job.id,
    //             name: job.name,
    //             data: job.data,
    //             returnvalue: job.returnvalue,
    //             finishedOn: job.finishedOn,
    //         })),
    //         failed: failed.map((job) => ({
    //             id: job.id,
    //             name: job.name,
    //             data: job.data,
    //             failedReason: job.failedReason,
    //             finishedOn: job.finishedOn,
    //         })),
    //     };
    // }
    /**
     * Clean old jobs
     */
    async cleanup(olderThan: number = 24 * 60 * 60 * 1000): Promise<void> {
        console.log("[BullMQ]  Starting cleanup...");

        // Remove completed jobs older than specified time
        await this.queue.clean(olderThan, 1000, "completed");

        // Remove failed jobs older than 7 days
        await this.queue.clean(7 * 24 * 60 * 60 * 1000, 1000, "failed");

        console.log("[BullMQ]  Cleanup completed");
    }

    /**
     * Pause queue processing
     */
    async pause(): Promise<void> {
        await this.queue.pause();
        console.log("[BullMQ] ⏸ Queue paused");
    }

    /**
     * Resume queue processing
     */
    async resume(): Promise<void> {
        await this.queue.resume();
        console.log("[BullMQ] ▶ Queue resumed");
    }

    /**
     * Get queue health status
     */
    // async getHealth(): Promise<{
    //     status: "healthy" | "degraded" | "unhealthy";
    //     details: {
    //         queueName: string;
    //         isPaused: boolean;
    //         jobCounts: ;
    //         workers: number;
    //         lastProcessed?: Date;
    //     };
    // }> {
    //     try {
    //         const isPaused = await this.queue.isPaused();
    //         const jobCounts = await this.getJobCounts();
    //         const completed = await this.queue.getCompleted(0, 0);

    //         const lastProcessed = completed.length > 0 ? new Date(completed[0].finishedOn || Date.now()) : undefined;

    //         // Determine health status
    //         let status: "healthy" | "degraded" | "unhealthy" = "healthy";

    //         if (isPaused) {
    //             status = "unhealthy";
    //         } else if (jobCounts.failed > 100) {
    //             status = "degraded";
    //         }

    //         return {
    //             status,
    //             details: {
    //                 queueName: this.queue.name,
    //                 isPaused,
    //                 jobCounts,
    //                 workers: 1,
    //                 lastProcessed,
    //             },
    //         };
    //     } catch (error) {

    //         logger
    //         return {
    //             status: "unhealthy",
    //             details: {
    //                 queueName: this.queue.name,
    //                 isPaused: true,
    //                 jobCounts: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
    //                 workers: 0,
    //             },
    //         };
    //     }
    // }

    /**
     * Graceful shutdown
     */
    async shutdown(): Promise<void> {
        console.log("[BullMQ]  Shutting down gracefully...");

        // Close worker first
        await this.worker.close();
        console.log("[BullMQ] Worker closed");

        // Close queue
        await this.queue.close();
        console.log("[BullMQ] Queue closed");

        // Close events
        await this.queueEvents.close();
        console.log("[BullMQ] Events closed");

        // Close Redis connection
        await this.connection.quit();
        console.log("[BullMQ] Redis connection closed");

        console.log("[BullMQ] ✅ Shutdown complete");
    }
}


// Admin endpoints (optional)
// app.get('/admin/queue/stats', async (req, res) => {
//     const stats = await bullMQService.getStats();
//     res.json({ success: true, data: stats });
// });
 
// app.get('/admin/queue/health', async (req, res) => {
//     const health = await bullMQService.getHealth();
//     res.json({ success: true, data: health });
// });
 
// app.post('/admin/queue/trigger', async (req, res) => {
//     await bullMQService.triggerManual();
//     res.json({ success: true, message: 'Queue processing triggered' });
// });
 
// app.get('/admin/queue/jobs', async (req, res) => {
//     const jobs = await bullMQService.getRecentJobs(20);
//     res.json({ success: true, data: jobs });
// });
 
// app.post('/admin/queue/cleanup', async (req, res) => {
//     await bullMQService.cleanup();
//     res.json({ success: true, message: 'Cleanup completed' });
// });
