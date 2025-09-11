"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type FormInfos = {
  fname: string;
  lname: string;
  email: string;
  phone: string;
  password: string;
  cPassword: string;
  refCode: string;
};

export type FormType = "signup" | "login" | "forgot";

interface FormProp {
  formtype: FormType;
}

export default function Form({ formtype }: FormProp) {
    const showField = (field: string) => {
        if (formtype === "signup") return true;
        if (formtype === "login") return field === "email" || field === "password";
        if (formtype === "forgot") return field === "email";
        return false;
    };

    const formHeading = (): { title: string; subtitle: string } => {
        switch (formtype) {
            case "signup":
            return {
                title: "Create your account",
                subtitle:
                "Join thousands of users who trust Sliqpay for their digital lifestyle needs",
            };
            case "login":
            return {
                title: "Welcome back",
                subtitle: "Sign in to your account to continue where you left off",
            };
            case "forgot":
            return {
                title: "Forgot Password?",
                subtitle: "Enter your email to reset your password",
            };
            default:
            return {
                title: "",
                subtitle: "",
            };
        }
    };

    const { title, subtitle } = formHeading();

    const [formInfos, setFormInfos] = useState<FormInfos>({
        fname: "",
        lname: "",
        email: "",
        phone: "",
        password: "",
        cPassword: "",
        refCode: "",
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const router = useRouter();
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api/v1";

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        if (formtype === 'signup' && formInfos.password !== formInfos.cPassword) {
            setErrorMsg('Passwords do not match');
            return;
        }
        if (!formInfos.email || (formtype !== 'forgot' && !formInfos.password)) {
            setErrorMsg('Email and password are required');
            return;
        }
        try {
            setLoading(true);
            const endpoint = formtype === 'signup' ? '/auth/signup' : formtype === 'login' ? '/auth/login' : '/auth/login';
            const payload: any = { email: formInfos.email, password: formInfos.password };
            if (formtype === 'signup') {
                payload.fname = formInfos.fname;
                payload.lname = formInfos.lname;
            }
            await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
            router.push('/dashboard');
        } catch (err: any) {
            setErrorMsg(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4fdf8] flex flex-col justify-center items-center p-6 space-y-12">
        <img
            src="/Sliqpayvisual12.png"
            alt="SliqPay"
            className="h-12 mx-auto mb-4"
        />   
        <form onSubmit={onSubmit} className="px-8 pt-6 pb-12 mb-4 w-full max-w-md bg-white shadow-md rounded-lg">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">{title}</h1>
                <p className="text-sm text-gray-600">{subtitle}</p>
            </div>
            {errorMsg && <p className="text-sm text-red-600 mb-4" role="alert">{errorMsg}</p>}

            {showField("fname") && (
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">First Name</label>
                <input
                    type="text"
                    className="w-full border rounded px-3 py-10"
                    placeholder="John"
                    value={formInfos.fname}
                    onChange={(e) =>
                        setFormInfos({ ...formInfos, fname: e.target.value })
                    }
                />
            </div>
            )}

            {showField("lname") && (
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">Last Name</label>
                <input
                type="text"
                className="w-full border rounded px-3 py-10"
                placeholder="Doe"
                value={formInfos.lname}
                onChange={(e) =>
                    setFormInfos({ ...formInfos, lname: e.target.value })
                }
            />
            </div>
            )}

            {showField("email") && (
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">Email</label>
                <input
                type="email"
                className="w-full border rounded px-3 py-10"
                placeholder="john@example.com"
                value={formInfos.email}
                onChange={(e) =>
                    setFormInfos({ ...formInfos, email: e.target.value })
                }
            />
            </div>
            )}

            {showField("phone") && (
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">Phone Number</label>
                <input
                type="tel"
                className="w-full border rounded px-3 py-10"
                placeholder="+234 801 234 5678"
                value={formInfos.phone}
                onChange={(e) =>
                    setFormInfos({ ...formInfos, phone: e.target.value })
                }
            />
            </div>
            )}

            {showField("password") && (
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">Password</label>
                <input
                type="password"
                className="w-full border rounded px-3 py-10"
                placeholder="••••••••"
                value={formInfos.password}
                onChange={(e) =>
                    setFormInfos({ ...formInfos, password: e.target.value })
                }
            />
            </div>
            )}

            {showField("cPassword") && (
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">Confirm Password</label>
                <input
                type="password"
                className="w-full border rounded px-3 py-10"
                placeholder="••••••••"
                value={formInfos.cPassword}
                onChange={(e) =>
                    setFormInfos({ ...formInfos, cPassword: e.target.value })
                }
            />
            </div>
            )}

            {showField("refCode") && (
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">Referral Code (Optional)</label>
                <input
                type="text"
                className="w-full border rounded px-3 py-10"
                placeholder="REF123"
                value={formInfos.refCode}
                onChange={(e) =>
                    setFormInfos({ ...formInfos, refCode: e.target.value })
                }
            />
            </div>
            )}

            <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors disabled:opacity-60"
            >
            {loading ? 'Please wait...' : (formtype === "signup" ? "Create Account" : formtype === "login" ? "Sign In" : "Reset Password")}
            </button>

            <div className="text-center mt-4">
            {formtype === "signup" ? (
                <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a href="/auth/login" className="text-green-600 hover:underline">
                    Sign in
                </a>
                </p>
            ) : formtype === "login" ? (
                <div className="space-y-2">
                <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <a href="/auth/signup" className="text-green-600 hover:underline">
                        Sign up
                    </a>
                </p>
                <p className="text-sm text-gray-600">
                    <a href="/auth/forgotpassword" className="text-green-600 hover:underline">
                        Forgot your password?
                    </a>
                </p>
                </div>
            ) : (
                <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <a href="/auth/login" className="text-green-600 hover:underline">
                    Sign in
                </a>
                </p>
            )}
            </div>
        </form>
        </div>
    );
}