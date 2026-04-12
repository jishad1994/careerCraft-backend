
export interface CancellationOptions {
    reason?: string;
    activateNextImmediately?: boolean; 
}

export interface CancellationResult {
    success: boolean;
    message: string;
    cancelledSubscriptionId: string;
    activatedSubscriptionId?: string;
    queueReordered: boolean;
    remainingQueue: number;
}
export interface ISubscriptionCancellationQueueService {
    cancelSubscriptionWithQueueManagement(
        companyId: string,
        options?: CancellationOptions,
    ): Promise<CancellationResult>;

    cancelSubscriptionAndClearQueue(
        companyId: string,
        reason?: string,
    ): Promise<{
        success: boolean;
        message: string;
        cancelledCount: number;
        cancelledIds: string[];
    }>;

    removeFromQueue(
        companyId: string,
        subscriptionId: string,
    ): Promise<{
        success: boolean;
        message: string;
        removedPosition: number;
        queueReordered: boolean;
    }>;

    getCancellationPreview(
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
    }>;

    pauseSubscription(
        companyId: string,
        reason?: string,
    ): Promise<{
        success: boolean;
        message: string;
        pausedUntil?: Date;
    }>;
}