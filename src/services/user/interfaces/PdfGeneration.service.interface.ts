import { IResumeData } from "../../../models/resume/resume.interface";

export interface IPdfGenerateService {
    generatePdf(resumeData: IResumeData): Promise<Buffer>;
    generateOfferLetterPdf(html: string): Promise<Buffer>;
}
