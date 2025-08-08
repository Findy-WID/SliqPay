"use client"; //for rituals

import Form from "@/components/Form";

export default function Signup() {
    return(
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Form formtype="signup" />
            </div>
        </div>
    )
}