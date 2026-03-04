import { IInterview } from "../models/job-application/job-application.interface";

export interface InterviewFilter {
  companyId?: string;
  jobId?: string;
  applicationId?: string;
  status?: string[];
  type?: string[];
  round?: number;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface InterviewWithPopulated {
  _id: string;
  interview: IInterview;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantProfilePicture?: {
    key: string;
    location: string;
  };
  applicationStatus: string;
  appliedAt: Date;
}

export type InterviewMatch = {
  "interviews.status"?: { $in: string[] };
  "interviews.type"?: { $in: string[] };
  "interviews.round"?: number;
  "interviews.scheduledAt"?: {
    $gte?: Date;
    $lte?: Date;
  };
};