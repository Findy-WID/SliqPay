"use client";

import Form from "@/components/Form";

export default function Login() {
        return (
            <div className="min-h-screen bg-[#f7fbff] relative flex items-center justify-center p-6">
                {/* decorative blobs */}
                <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
                <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>
                <Form formtype="login" />
            </div>
        );
} 