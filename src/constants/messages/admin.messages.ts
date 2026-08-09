export const ADMIN_JOB_MESSAGES = {
    FETCH_SUCCESS: "Jobs fetched successfully",
    VERIFIED: "Job verified successfully",
    BLOCKED: "Job blocked successfully",
    UNBLOCKED: "Job unblocked successfully",
    DELETED: "Job deleted successfully",
} as const;

export const SUBSCRIPTION_PLAN_MESSAGES = {
    PLAN_NOT_FOUND: "Plan not found",
    FETCH_SUCCESSFULL: "Subscription plans fetch successfull",
    FETCH_SUCCESSFULL_BY_ID: "Subscription plans fetch by id successfull",
    CREATED: "Subscription plan created successfully",
    UPDATED: "Subscription plan updated successfully",
    DELETED: "Subscription plan deleted successfully",
    TOGGLE_STATUS: "Subscription plan status changed successfully",
} as const;
