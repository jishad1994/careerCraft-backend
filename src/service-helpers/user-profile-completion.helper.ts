import { IUser, IUserPopulated } from "../models/user/user.interface";

interface IUserProfileRule {
    key: string;
    weight: number;
    validate: (user: IUser|IUserPopulated) => boolean;
}
const USER_PROFILE_RULES: IUserProfileRule[] = [
    {
        key: "profilePicture",
        weight: 10,
        validate: u => !!u.profilePicture,
    },
    {
        key: "about",
        weight: 10,
        validate: u => !!u.about && u.about.trim().length > 20,
    },
    {
        key: "skills",
        weight: 15,
        validate: u => !!u.skills && u.skills.length > 0,
    },
    {
        key: "resume",
        weight: 20,
        validate: u => !!u.resumeURL && u.resumeURL.length > 0,
    },
    {
        key: "education",
        weight: 15,
        validate: u => !!u.education && u.education.length > 0,
    },
    {
        key: "experience",
        weight: 20,
        validate: u => !!u.experience && u.experience.length > 0,
    },
    {
        key: "certificates",
        weight: 5,
        validate: u => !!u.certificates && u.certificates.length > 0,
    },
    {
        key: "location",
        weight: 5,
        validate: u => !!u.location,
    },
];
export class UserProfileCompletionHelper {
    static getCompletionPercentage(user: IUser|IUserPopulated): number {
        let completedWeight = 0;

        for (const rule of USER_PROFILE_RULES) {
            if (rule.validate(user)) {
                completedWeight += rule.weight;
            }
        }

        return Math.min(completedWeight, 100);
    }
}
