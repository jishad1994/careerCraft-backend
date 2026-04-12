import { Document, Types } from "mongoose";
 
// ---- Embedded sub-document shapes ----
 
export interface IResumePersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    portfolio?: string;
}
 
export interface IResumeSummary {
    text: string;
}
 
export interface IResumeExperience {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description: string;
    achievements: string[];
}
 
export interface IResumeEducation {
    degree: string;
    institution: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    grade?: string;
}
 
export interface IResumeSkill {
    name: string;
    category?: string;
}
 
export type ResumeTemplateId = "classic" | "modern" | "minimal";
 
// ---- The persisted Resume document (one per user) ----
 
export interface IResume extends Document {
    userId: Types.ObjectId;
    personalInfo: IResumePersonalInfo;
    summary: IResumeSummary;
    experience: IResumeExperience[];
    education: IResumeEducation[];
    skills: IResumeSkill[];
    templateId: ResumeTemplateId;
    lastSavedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}


export interface IResumeData {
    personalInfo: IResumePersonalInfo;
    summary: IResumeSummary;
    experience: IResumeExperience[];
    education: IResumeEducation[];
    skills: IResumeSkill[];
    templateId: ResumeTemplateId;
}
 

 
export interface IResumeTemplate {
    id: ResumeTemplateId;
    name: string;
    description: string;
    previewImage?: string;
}
 
 
export interface IGeneratePdfRequest {
    resumeData: IResumeData;
}
 
export interface IGeneratePdfResponse {
    pdfBuffer: Buffer;
    fileName: string;
}
 
export interface IUploadResumeRequest {
    resumeData: IResumeData;
    userId: string;
}
 
export interface IUploadResumeResponse {
    message: string;
    documentKey: string;
    signedURL?: string;
}
 
export interface IProfileDataResponse {
    personalInfo: IResumePersonalInfo;
    summary: IResumeSummary;
    experience: IResumeExperience[];
    education: IResumeEducation[];
    skills: IResumeSkill[];
}
 
// ---- Saved resume response sent to frontend ----
 
export interface ISavedResumeResponse {
    personalInfo: IResumePersonalInfo;
    summary: IResumeSummary;
    experience: IResumeExperience[];
    education: IResumeEducation[];
    skills: IResumeSkill[];
    templateId: ResumeTemplateId;
    lastSavedAt: Date;
}