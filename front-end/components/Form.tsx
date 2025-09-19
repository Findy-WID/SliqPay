"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { z } from "zod";
import { signupSchema, loginSchema, sanitizePhone } from "@/lib/validation/auth";

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
        if (formtype === "signup") return ["fname","lname","email","phone","password","cPassword","refCode"].includes(field);
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
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);
        setFieldErrors({});
        try {
            setLoading(true);
            let payload: any;
            if (formtype === "signup") {
              const parsed = signupSchema.safeParse({ ...formInfos, phone: sanitizePhone(formInfos.phone) });
              if (!parsed.success) {
                const fe: Record<string,string> = {};
                const f = parsed.error.flatten();
                Object.entries(f.fieldErrors).forEach(([k,v]) => { if (v && v.length) fe[k] = v[0]!; });
                setFieldErrors(fe);
                setErrorMsg("Please fix the highlighted fields");
                return;
              }
              const v = parsed.data;
              payload = { fname: v.fname, lname: v.lname, email: v.email, password: v.password, phone: v.phone || undefined, refCode: formInfos.refCode?.trim() || undefined };
            } else if (formtype === "login") {
              const parsed = loginSchema.safeParse({ email: formInfos.email, password: formInfos.password });
              if (!parsed.success) {
                const fe: Record<string,string> = {};
                const f = parsed.error.flatten();
                Object.entries(f.fieldErrors).forEach(([k,v]) => { if (v && v.length) fe[k] = v[0]!; });
                setFieldErrors(fe);
                setErrorMsg("Please fix the highlighted fields");
                return;
              }
              const v = parsed.data;
              payload = { email: v.email, password: v.password };
            } else {
              // forgot
              const emailOnly = z.object({ email: z.string().trim().email("Enter a valid email address") });
              const parsed = emailOnly.safeParse({ email: formInfos.email });
              if (!parsed.success) {
                const fe: Record<string,string> = {};
                const f = parsed.error.flatten();
                Object.entries(f.fieldErrors).forEach(([k,v]) => { if (v && v.length) fe[k] = v[0]!; });
                setFieldErrors(fe);
                setErrorMsg("Please provide a valid email");
                return;
              }
              payload = { email: parsed.data.email };
            }

            const endpoint = formtype === 'signup' ? '/auth/signup' : formtype === 'login' ? '/auth/login' : '/auth/forgotpassword';
            await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
            // success
            if (formtype === 'forgot') {
              setSuccessMsg('If the email exists, a reset link has been sent. Please check your inbox.');
              return;
            }
            setFormInfos({ fname: "", lname: "", email: "", phone: "", password: "", cPassword: "", refCode: "" });
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
            {successMsg && <p className="text-sm text-green-600 mb-4" role="status">{successMsg}</p>}

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
                {fieldErrors.fname && <p className="text-xs text-red-600 mt-1">{fieldErrors.fname}</p>}
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
            {fieldErrors.lname && <p className="text-xs text-red-600 mt-1">{fieldErrors.lname}</p>}
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
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
            </div>
            )}

            {showField("phone") && (
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">Phone Number</label>
                <input
                type="tel"
                className="w-full border rounded px-3 py-10"
                placeholder="+2348012345678"
                value={formInfos.phone}
                onChange={(e) => setFormInfos({ ...formInfos, phone: e.target.value })}
                inputMode="tel"
                autoComplete="tel"
                />
                {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
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
            {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
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
            {fieldErrors.cPassword && <p className="text-xs text-red-600 mt-1">{fieldErrors.cPassword}</p>}
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