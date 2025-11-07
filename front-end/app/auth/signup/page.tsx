"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Form from "@/components/Form";

export default function Signup() {
    const [showForm, setShowForm] = useState(false);
    const [language, setLanguage] = useState("English (US)");
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#f7fbff] relative flex flex-col items-center p-6">
            {/* decorative blobs similar to mock */}
            <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
            <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

            {/* Logo and language switch (top-right) */}
            <div className="w-full max-w-md flex items-center justify-between mt-4">
                <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
                <div className="hidden sm:flex items-center gap-2">
                    <label htmlFor="lang-top" className="sr-only">Language</label>
                    <select
                        id="lang-top"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="text-sm border rounded-md px-2 py-1 bg-white"
                    >
                        <option value="English (US)">English (US)</option>
                        <option value="French">French</option>
                        <option value="Swahili">Swahili</option>
                    </select>
                </div>
            </div>

            {!showForm ? (
                <div className="w-full max-w-md mt-10">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-extrabold mb-1 tracking-tight">Welcome to Sliqpay</h1>
                        <p className="text-sm text-gray-500">To continue choose preferred Language for the app</p>
                    </div>
                    <div className="bg-white border border-blue-100 rounded-2xl shadow-sm p-5">
                        <p className="text-center text-green-700 font-semibold mb-3">Select app Language</p>
                        <label htmlFor="lang-card" className="block text-xs text-gray-500 mb-1">App Language</label>
                        <select
                            id="lang-card"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full border rounded-xl px-3 py-3 bg-white text-gray-700 text-sm"
                        >
                            <option value="English (US)">English (US)</option>
                            <option value="French">French</option>
                            <option value="Swahili">Swahili</option>
                        </select>
                        <button
                            className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700"
                            onClick={() => router.push('/auth/signup/get-started')}
                        >
                            Continue with {language}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}