import { OAuth2Client } from "google-auth-library";
export interface IGoogleCredentials {
    sub: string;
    email: string;
    emailVerified: boolean;
    givenName?: string;
    familyName?: string;
    picture?: string;
}

export async function verifyGoogleAuthToken(idToken: string): Promise<IGoogleCredentials> {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error("Invalid Google Token:no email");

    return {
        email: payload.email,
        emailVerified: !!payload.email_verified,
        givenName: payload.given_name,
        familyName: payload.family_name,
        picture: payload.picture,
        sub: payload.sub,//google id
    };
}
