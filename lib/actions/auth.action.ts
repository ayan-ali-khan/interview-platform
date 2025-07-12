"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7; // seconds

export async function signUp(params: SignUpParams){
    const { uid, name, email, password } = params;

    try {
        const userRecord = await db.collection("users").doc(uid).get();

        if(userRecord.exists){
            return {
                success: false,
                message: "User already exists. Please log in instead."
            }
        }

        await db.collection("users").doc(uid).set({
            name, email
        });

        return {
            success: true,
            message: "User created successfully.Please log in.",
        }
         
    } catch (e: any) {
        console.error("Error during creating a user:", e);

        if(e.code === "auth/email-already-exists"){
            return {
                success: false,
                message: "Email already exists. Please use a different email."
            }
        }

        return {
            success: false,
            message: "An error occurred while creating the user. Please try again later."
        }
    }
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    try {
        const userRecord = await auth.getUserByEmail(email);
        
        if(!userRecord){
            return {
                success: false,
                message: "User not found. Please sign up."
            }
        }

        await setSessionCookie(idToken);
    } catch (error) {
        console.log(error);
        return{
            success: false,
            message: "Failed to login."
        }
    }
}

export async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000,//days
    })

    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    })
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if(!sessionCookie){
        return null;
    }

    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

        const userRecord = await db.collection("users").doc(decodedClaims.uid).get();

        if(!userRecord.exists) return null;

        return {
            ...userRecord.data(),
            id: userRecord.id,
        } as User;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function isAuthenticated() {
    const user = await getCurrentUser();

    return !!user;
}