"use client";
import { signIn } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export default function Page() {
    const siginInHandler = async () => {
        await signIn.email({
            email: "test@example.com",
            password: "12345678",
            callbackURL: "/"
        }, {
            onSuccess: () => {
                alert("signin successful")
            }
        })
    }
    return (
        <Button onClick={() => siginInHandler()}>Sign In</Button>
    )
}