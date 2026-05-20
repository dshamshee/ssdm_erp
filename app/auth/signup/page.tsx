"use client";
import { signUp } from "@/lib/auth-client"

export default function Page() {

    const signUpHandler = async () => {
        await signUp.email({
            email: "test@example.com",
            password: "12345678",
            name: "Test User",
            callbackURL: "/"
        }, {
            onSuccess: () => {
                alert("signup successful")
            }
        })
    }

    return (
        <button onClick={() => signUpHandler()}>Sign Up</button>
    )
}