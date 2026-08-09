import { IExperience } from "../models/user/user.interface";

export function calculateTotalExperience(expArray: IExperience[]): { years: number; months: number } {
    let totalMonths = 0;

    for (const exp of expArray) {
        const start = new Date(exp.startDate);
        const end = exp.isCurrent ? new Date() : new Date(exp.endDate ?? new Date());
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        totalMonths += months;
    }

    return {
        years: +(totalMonths / 12).toFixed(1),
        months: totalMonths,
    };
}
