// subscription-cancellation-queue.service.ts

import { AppError } from "../../../errors-classes/app.error.";
import { ValidationError } from "../../../errors-classes/validation.error";
import { SubscriptionStatus } from "../../../models/company-subscription/company-subscription.interface";
import { ICompanySubscriptionRepository } from "../../../repositories/company-subscription/company-subscription.repository.interface";
import { CancellationOptions, CancellationResult } from "../interfaces/subscritpion-cancellation.interface";

export class SubscriptionCancellationQueueService {
    constructor(private readonly _companySubscriptionRepository: ICompanySubscriptionRepository) {}

    /**
     * Cancel current subscription and handle queue
     *
     * Options:
     * 1. Cancel and activate next queued immediately
     * 2. Cancel and wait (next will activate on scheduled date)
     */
    async cancelSubscriptionWithQueueManagement(
        companyId: string,
        options: CancellationOptions = {},
    ): Promise<CancellationResult> {
        const {
            reason = "Cancelled by user",
            activateNextImmediately = true, // Default: activate next immediately
        } = options;

        console.log("activateNextImmediately", activateNextImmediately);
        // 1. Find active subscription
        const activeSubscription = await this._companySubscriptionRepository.findActiveByCompany(companyId);

        if (!activeSubscription) {
            throw new ValidationError("No active subscription found", 404);
        }

        // 2. Cancel the active subscription
        const cancelledSubscription = await this._companySubscriptionRepository.cancel(
            activeSubscription._id.toString(),
            reason,
        );

        if (!cancelledSubscription) {
            throw new AppError("Failed to cancel subscription", 500);
        }

        console.log(`[Cancellation] Cancelled subscription ${activeSubscription._id} for company ${companyId}`);

        // 3. Get queued subscriptions
        const queuedSubscriptions = await this._companySubscriptionRepository.findQueuedByCompany(companyId);

        let activatedSubscriptionId: string | undefined;
        let queueReordered = false;

        if (queuedSubscriptions.length > 0) {
            if (activateNextImmediately) {
                // OPTION A: Activate next queued subscription immediately
                const nextSubscription = queuedSubscriptions[0]; // Position 1

                // Activate it
                await this._companySubscriptionRepository.updateOneByFilter(
                    { _id: nextSubscription._id },
                    {
                        status: SubscriptionStatus.ACTIVE,
                        isQueued: false,
                        queuePosition: 0,
                        startDate: new Date(), // Start now instead of scheduled date
                        activatedAt: new Date(),
                        endDate: new Date(Date.now() + nextSubscription.snapShot.durationInDays * 24 * 60 * 60 * 1000),
                        scheduledStartDate: new Date(Date.now() ), // Set end date based on duration
                    },
                );

               

                activatedSubscriptionId = nextSubscription._id.toString();
                console.log(`[Cancellation] ✅ Activated queued subscription ${nextSubscription._id} immediately`);

                // Reorder remaining queued subscriptions
                for (let i = 1; i < queuedSubscriptions.length; i++) {
                    const newPosition = i;
                    const previousSub =
                        i === 1
                            ? await this._companySubscriptionRepository.findById(nextSubscription._id.toString())
                            : queuedSubscriptions[i - 1];

                    // Recalculate scheduled start date based on new previous subscription
                    const newScheduledStart = new Date(previousSub!.endDate);
                    newScheduledStart.setSeconds(newScheduledStart.getSeconds() + 1);

                    await this._companySubscriptionRepository.updateOneByFilter(
                        { _id: queuedSubscriptions[i]._id },
                        {
                            queuePosition: newPosition,
                            scheduledStartDate: newScheduledStart,
                            previousSubscriptionId: previousSub!._id,
                        },
                    );

                    console.log(
                        `[Cancellation] Reordered subscription ${queuedSubscriptions[i]._id} to position ${newPosition}`,
                    );
                }

                queueReordered = true;
            } else {
                // OPTION B: Keep queue as-is, let it activate on scheduled date
                console.log(
                    `[Cancellation] Queue maintained. Next subscription will activate on scheduled date: ${queuedSubscriptions[0].scheduledStartDate}`,
                );
            }
        }

        return {
            success: true,
            message: activatedSubscriptionId
                ? "Subscription cancelled and next subscription activated"
                : queuedSubscriptions.length > 0
                ? "Subscription cancelled. Next subscription will activate on scheduled date"
                : "Subscription cancelled",
            cancelledSubscriptionId: cancelledSubscription._id.toString(),
            activatedSubscriptionId,
            queueReordered,
            remainingQueue: activateNextImmediately ? queuedSubscriptions.length - 1 : queuedSubscriptions.length,
        };
    }

    /**
     * Cancel subscription and delete entire queue
     * Use when user wants to cancel everything
     */
    async cancelSubscriptionAndClearQueue(
        companyId: string,
        reason: string = "User cancelled all subscriptions",
    ): Promise<{
        success: boolean;
        message: string;
        cancelledCount: number;
        cancelledIds: string[];
    }> {
        // 1. Cancel active subscription
        const activeSubscription = await this._companySubscriptionRepository.findActiveByCompany(companyId);

        const cancelledIds: string[] = [];

        if (activeSubscription) {
            await this._companySubscriptionRepository.cancel(activeSubscription._id.toString(), reason);
            cancelledIds.push(activeSubscription._id.toString());
            console.log(`[Cancellation] Cancelled active subscription ${activeSubscription._id}`);
        }

        // 2. Cancel all queued subscriptions
        const queuedSubscriptions = await this._companySubscriptionRepository.findQueuedByCompany(companyId);

        for (const queued of queuedSubscriptions) {
            await this._companySubscriptionRepository.cancel(queued._id.toString(), reason);
            cancelledIds.push(queued._id.toString());
            console.log(`[Cancellation] Cancelled queued subscription ${queued._id}`);
        }

        return {
            success: true,
            message: `Cancelled ${cancelledIds.length} subscription(s)`,
            cancelledCount: cancelledIds.length,
            cancelledIds,
        };
    }

    /**
     * Remove specific subscription from queue
     * Reorders remaining queue
     */
    async removeFromQueue(
        companyId: string,
        subscriptionId: string,
    ): Promise<{
        success: boolean;
        message: string;
        removedPosition: number;
        queueReordered: boolean;
    }> {
        // 1. Find the subscription
        const subscription = await this._companySubscriptionRepository.findById(subscriptionId);

        if (!subscription) {
            throw new ValidationError("Subscription not found", 404);
        }

        if (subscription.companyId.toString() !== companyId) {
            throw new ValidationError("Unauthorized", 403);
        }

        if (!subscription.isQueued || subscription.status !== "queued") {
            throw new ValidationError("Subscription is not in queue", 400);
        }

        const removedPosition = subscription.queuePosition;

        // 2. Cancel the queued subscription
        await this._companySubscriptionRepository.cancel(subscriptionId, "Removed from queue by user");

        console.log(`[Queue Management] Removed subscription ${subscriptionId} from position ${removedPosition}`);

        // 3. Get remaining queued subscriptions
        const remainingQueue = await this._companySubscriptionRepository.findQueuedByCompany(companyId);

        // 4. Reorder queue (fill the gap)
        if (remainingQueue.length > 0) {
            // Get active or last activated subscription
            const activeSubscription = await this._companySubscriptionRepository.findActiveByCompany(companyId);

            let previousSub = activeSubscription;

            for (let i = 0; i < remainingQueue.length; i++) {
                const newPosition = i + 1;

                // Recalculate scheduled start date
                const newScheduledStart = previousSub ? new Date(previousSub.endDate) : new Date();

                if (previousSub) {
                    newScheduledStart.setSeconds(newScheduledStart.getSeconds() + 1);
                }

                await this._companySubscriptionRepository.updateOneByFilter(
                    { _id: remainingQueue[i]._id },
                    {
                        queuePosition: newPosition,
                        scheduledStartDate: newScheduledStart,
                        previousSubscriptionId: previousSub?._id,
                    },
                );

                console.log(
                    `[Queue Management] Reordered subscription ${remainingQueue[i]._id} to position ${newPosition}`,
                );

                previousSub = remainingQueue[i];
            }
        }

        return {
            success: true,
            message: `Subscription removed from queue position ${removedPosition}`,
            removedPosition,
            queueReordered: remainingQueue.length > 0,
        };
    }

    /**
     * Get cancellation preview
     * Shows what will happen if user cancels
     */
    async getCancellationPreview(
        companyId: string,
    ): Promise<{
        currentSubscription: {
            id: string;
            name: string;
            daysRemaining: number;
            estimatedRefund: number;
        };
        willActivateNext: boolean;
        nextSubscription?: {
            id: string;
            name: string;

            queuePosition: number;
            scheduledDate: Date;
            willActivateImmediately: boolean;
        };
        remainingQueue: number;
        totalRefund: number;
    }> {
        const activeSubscription = await this._companySubscriptionRepository.findActiveByCompany(companyId);

        if (!activeSubscription) {
            throw new ValidationError("No active subscription found", 404);
        }

        const queuedSubscriptions = await this._companySubscriptionRepository.findQueuedByCompany(companyId);

        const willActivateNext = queuedSubscriptions.length > 0;
        const nextSubscription = willActivateNext ? queuedSubscriptions[0] : undefined;

        // Calculate potential refund (simplified - would need actual logic)
        const now = new Date();
        const endDate = new Date(activeSubscription.endDate);
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const totalDays = activeSubscription.snapShot.durationInDays;
        const refundPercentage = daysRemaining / totalDays;
        const totalRefund = Math.floor(activeSubscription.snapShot.price * refundPercentage);

        return {
            currentSubscription: {
                id: activeSubscription._id.toString(),
                name: activeSubscription.snapShot.name,
                daysRemaining,
                estimatedRefund: totalRefund,
            },
            willActivateNext,
            nextSubscription: nextSubscription
                ? {
                      id: nextSubscription._id.toString(),
                      name: nextSubscription.snapShot.name,
                      queuePosition: nextSubscription.queuePosition,
                      scheduledDate: nextSubscription.scheduledStartDate,
                      willActivateImmediately: true,
                  }
                : undefined,
            remainingQueue: queuedSubscriptions.length,
            totalRefund,
        };
    }

    /**
     * Pause subscription (mark as paused, keep in database)
     * Alternative to cancellation
     */
    async pauseSubscription(
        companyId: string,
        reason: string = "Paused by user",
    ): Promise<{
        success: boolean;
        message: string;
        pausedUntil?: Date;
    }> {
        const activeSubscription = await this._companySubscriptionRepository.findActiveByCompany(companyId);

        if (!activeSubscription) {
            throw new ValidationError("No active subscription found", 404);
        }

        // Update to a paused state (you'd need to add this status to your enum)
        await this._companySubscriptionRepository.updateOneByFilter(
            { _id: activeSubscription._id },
            {
                status: SubscriptionStatus.CANCELLED, // Or add PAUSED status
                cancelReason: `Paused: ${reason}`,
                cancelledAt: new Date(),
            },
        );

        return {
            success: true,
            message: "Subscription paused successfully",
        };
    }
}
