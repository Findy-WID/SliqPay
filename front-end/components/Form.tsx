"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { z } from "zod";
import { signupSchema, loginSchema, sanitizePhone } from "@/lib/validation/auth";
import { useToast } from "@/hooks/use-toast";

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
    // Add error logging for debugging
    const [renderError, setRenderError] = useState<string | null>(null);

    useEffect(() => {
        try {
            // Log the form type and environment info
           
        } catch (error) {
            console.error("Error in useEffect:", error);
            setRenderError(error instanceof Error ? error.message : "Unknown error");
        }
    }, [formtype]);

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
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

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
    const { toast } = useToast();

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
        
            const response = await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
          
            
            // success
            if (formtype === 'forgot') {
              setSuccessMsg('If the email exists, a reset link has been sent. Please check your inbox.');
              return;
            }
            
            // Reset form
            setFormInfos({ fname: "", lname: "", email: "", phone: "", password: "", cPassword: "", refCode: "" });
            
            // Set success message
            setSuccessMsg(formtype === 'signup' ? 'Account created! Redirecting to dashboard...' : 'Login successful! Redirecting to dashboard...');
            
          
            
            // Use a safer approach that doesn't trigger CSP issues
            // Immediately try router push first
            try {
             
              router.push('/dashboard');
            } catch (error: unknown) {
              console.error("Error with router.push:", error);
              
              // If immediate push fails, use a plain function in setTimeout (not a string)
              const redirectToPath = () => {
              
                window.location.href = '/dashboard';
              };
              
              // Use the function reference, not a string
              setTimeout(redirectToPath, 1000);
            }
        } catch (err: any) {
            const message = err.message || 'Something went wrong';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f7fbff] relative flex flex-col justify-center items-center p-6">
        {/* subtle decorative background for auth pages */}
        {formtype === 'login' && (
            <>
              <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
              <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>
            </>
        )}
        {/* Show render errors if any */}
        {renderError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md mx-auto">
                <p><strong>Error rendering form:</strong> {renderError}</p>
            </div>
        )}
        
        {/* Use next/image or ensure image is properly deployed */}
        <img
            src="/Sliqpayvisual12.png"
            alt="SliqPay"
            className={`mb-4 ${formtype === 'login' ? 'h-6 self-start w-auto absolute left-6 top-6' : 'h-12 mx-auto'}`}
            onError={(e) => {
                e.currentTarget.onerror = null; 
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='32' viewBox='0 0 100 32'%3E%3Crect width='100' height='32' fill='%23eee'/%3E%3Ctext x='50' y='20' font-family='Arial' font-size='12' text-anchor='middle' fill='%23333'%3ESliqPay%3C/text%3E%3C/svg%3E";
                console.error("Failed to load image");
            }}
        />
        <form onSubmit={onSubmit} className="px-6 pt-6 pb-8 w-full max-w-md bg-white shadow-sm rounded-2xl border border-gray-100">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-extrabold mb-1 tracking-tight">{formtype === 'login' ? 'Welcome Back' : title}</h1>
                <p className="text-sm text-gray-500">{formtype === 'login' ? 'Sign In to continue' : subtitle}</p>
            </div>
            {errorMsg && <p className="text-sm text-red-600 mb-4" role="alert">{errorMsg}</p>}
            {successMsg && <p className="text-sm text-green-600 mb-4" role="status">{successMsg}</p>}

            {showField("fname") && (
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">First Name</label>
                <input
                    type="text"
                    className="w-full border rounded px-3 py-3"
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
                className="w-full border rounded px-3 py-3"
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
                className={`w-full rounded-xl px-4 py-3 outline-none transition border ${formtype==='login' ? 'bg-gray-100 border-gray-200 focus:border-gray-300' : 'border-gray-300 focus:border-gray-400'}`}
                placeholder={formtype==='login' ? 'Olabunmi@sampleemail.com' : 'john@example.com'}
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
                className="w-full border rounded px-3 py-3"
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
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={`w-full rounded-xl px-4 py-3 pr-10 outline-none transition border ${formtype==='login' ? 'bg-gray-100 border-gray-200 focus:border-gray-300' : 'border-gray-300 focus:border-gray-400'}`}
                                        placeholder={formtype==='login' ? '****************' : '••••••••'}
                                        value={formInfos.password}
                                        onChange={(e) =>
                                            setFormInfos({ ...formInfos, password: e.target.value })
                                        }
                                    />
                                    {formtype === 'login' && (
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? (
                                                /* eye-off */
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l18 18"/><path d="M10.58 10.58a2 2 0 102.83 2.83"/><path d="M16.24 16.24A8.45 8.45 0 0112 18c-5 0-9-6-9-6a16.9 16.9 0 014.22-4.22"/><path d="M14.12 9.88A2 2 0 0012 8a2 2 0 00-2 2"/><path d="M19.78 8.22A16.9 16.9 0 0121 12s-4 6-9 6a8.49 8.49 0 01-3.5-.74"/></svg>
                                            ) : (
                                                /* eye */
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                                            )}
                                        </button>
                                    )}
                                </div>
                                {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
                        </div>
                        )}

            {showField("cPassword") && (
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">Confirm Password</label>
                <input
                type="password"
                className="w-full border rounded px-3 py-3"
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
                className="w-full border rounded px-3 py-3"
                placeholder="REF123"
                value={formInfos.refCode}
                onChange={(e) =>
                    setFormInfos({ ...formInfos, refCode: e.target.value })
                }
            />
            </div>
            )}

                        {formtype === 'login' && (
                            <div className="mb-4 mt-2 flex items-center justify-between text-sm">
                                <label className="inline-flex items-center gap-2 select-none">
                                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300" checked={rememberMe} onChange={(e)=>setRememberMe(e.target.checked)} />
                                    <span className="text-gray-700">Remember me</span>
                                </label>
                                <a href="/auth/forgotpassword" className="text-blue-500 hover:underline">Forgot Password</a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-medium shadow-sm hover:bg-green-700 transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Please wait...' : (formtype === 'login' ? 'Continue' : formtype === 'signup' ? 'Create Account' : 'Reset Password')}
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
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <a href="/auth/signup" className="text-green-600 hover:underline">Signup</a>
                </p>
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