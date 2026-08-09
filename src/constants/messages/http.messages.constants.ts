export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,

    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
} as const;

export const HTTP_MESSAGES = {
    SUCCESS: "Success",
    CREATED: "Resource created successfully",
    UPDATED: "Resource updated successfully",
    DELETED: "Resource deleted successfully",

    LOGIN_SUCCESSFULL: "Login successful",
    LOGOUT_SUCCESSFULL: "Logout successfull",
    INVALID_SESSION_DATA: "Invalid session data. Please try again",
    OTP_SENT: "Verification code sent to user email",
    OTP_VERIFICATION_SUCCESSFULL: "OTP verification successful",
    OTP_VERIFICATION_FAILED: "OTP verification failed",
    GOOGLE_AUTH_SUCCESS: "Google authentication successful",
    OTP_VERIFICATION_REQUIRED: "OTP verification failed/required. Please verify your OTP first",
    PASSWORD_RESET_LINK_SENT: "Password reset link sent to user email",
    PASSWORD_RESET_SUCCESSFULL: "Password reset successful",
    REGISTRATION_SUCCESSFULL: "Registration successful",
    SESSION_EXPIRED: "Session expired, please try again later",
    TAMPERED_SESSION_DATA: "Session data is invalid or has been tampered with",

    BAD_REQUEST: "Bad request",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Access denied",
    NOT_FOUND: "Resource not found",
    CONFLICT: "Conflict with current state",
    VALIDATION_ERROR: "Validation failed",

    TOKEN_REFRESH_SUCCESSFULL: "Token refresh successful",
    MISSING_TOKEN: "Invalid or missing token",

    SERVER_ERROR: "Internal server error",
    SERVICE_UNAVAILABLE: "Service temporarily unavailable",
} as const;
