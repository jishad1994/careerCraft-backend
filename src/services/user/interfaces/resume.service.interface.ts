import { IResumeTemplate } from "../../../models/resume/resume.interface";
import { IProfileDataResponse, IResumeData, ISavedResumeResponse } from "../../../models/resume/resume.interface";

export interface IResumeBuilderService {
    getTemplates(): IResumeTemplate[];

    saveDraft(userId: string, resumeData: IResumeData): Promise<ISavedResumeResponse>;

    getSavedDraft(userId: string): Promise<ISavedResumeResponse | null>;

    getProfileData(userId: string): Promise<IProfileDataResponse>;

    generatePdf(resumeData: IResumeData): Promise<Buffer>;

    generateAndUpload(
        resumeData: IResumeData,
        userId: string,
    ): Promise<{
        documentKey: string;
        signedURL?: string;
    }>;
}
