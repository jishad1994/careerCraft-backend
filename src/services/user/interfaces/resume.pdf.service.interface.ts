import {  IResumeData } from "../../../models/resume/resume.interface";

export interface IResumePDFService {
   
    generatePdf(resumeData: IResumeData): Promise<Buffer>
}