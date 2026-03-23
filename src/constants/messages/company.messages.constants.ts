export const COMPANY_JOB_MESSAGES = {
    CREATED: "Job posted successfully",
    UPDATED: "Job updated successfully",
    STATUS_UPDATED: "Job status updated successfully",
    DELETED: "Job deleted successfully",
    FETCH_SUCCESSFULL: "Jobs fetch successfull",
    STATISTIC_FETCH_SUCCESSFULL: "Jobs statistics fetch successfull",
    JOB_NOT_FOUND: "Job not found",
} as const;

export const COMPANY_SKILL_MESSAGES = {
    FETCH_SUCCESSFULL: "Skill fetch successfull",
} as const;
export const COMPANY_PROFILE_MESSAGES = {
    PROFILE_FETCH_SUCCESSFULL: "Profile fetch successfull",
    VERIFICATION_REAPPLIED: "Verification re-applied successfully",
    PROFILE_UPDATED: "Profile updated successfull",
    ADDRESS_UPDATED: "Address updated successfully",
    PRFILE_PICTURE_UPDATED: "Profile picture updated successfull",
    PRFILE_PICTURE_DELETED: "Profile picture deletion successfull",
    BANNER_IMAGE_UPDATED: "Banner image updation successfull",
    BANNER_IMAGE_DELETED: "Banner image deletion successfull",
    DOCUMENT_UPLOADED: "Document uploading successfull",
    DOCUMENT_DELETED: "Document deletion successfull",
} as const;

export const COMPANY_JOB_APPLICATION_MESSAGES = {
    FETCH_SUCCESSFULL: "Application fetch successfull",
    STATUS_UPDATED: "Application status updated successfully",
    MARKED_AS_VIEWED: "Application marked as viewed",
    ADD_NOTES_SUCCESSFULL: "Notes added successfully",
    STATISTIC_FETCH_SUCCESSFULL: "Statistics fetched successfully",
    REJECTED: "Application rejected successfully",

    TOGGLE_FLAG_SUCCESSFULL: (flaggedStatus: string) => `Application ${flaggedStatus} successfully`,
} as const;

export const INTERVIEW_MESSAGES = {
    INTERVIEWS_FETCHED: "Interviews fetched successfully",
    INTERVIEW_FETCHED: "Interview fetched successfully",
    INTERVIEWS_STATISTICS_FETCHED_SUCCESSFULLY: "Interview stats fetched successfully",
    INTERVIEW_COMPLETED: "Interview completed",
    INTERVIEW_UPDATED: "Interview updated successfully",
    INTERVIEW_CANCELLED: "Interview cancelled",
    INTERVIEW_RESCHEDULED: "Interview rescheduled",
    INTERVIEW_SCHEDULED_SUCCESSFULLY: "Interview scheduled successfully",
    UPCOMING_INTERVIEWS_FETCHED: "Upcoming interviews fetched successfully",
} as const;

export const COMPANY_DOCUMENT_MESSAGES = {
    DOCUMENT_NOT_FOUND: "Document not found",
    INVALID_DOCUMENT_KEY:"Invalid document key"
};

export const COMPANY_CANDIDATES_MESSAGE = {
    CANDIDATE_PROFILE_FETCH_SUCCESSFULL: "Candidate profile fetch successfull",
};
