"use client";

import { useState } from "react";

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


    const { title, subtitle } = formHeading() ;

    const [formInfos, setFormInfos] = useState<FormInfos>({
        fname: "",
        lname: "",
        email: "",
        phone: "",
        password: "",
        cPassword: "",
        refCode: "",
    });

    const isLogin = formtype === 'login';
    const isSignup = formtype === 'signup';
    const isForgot = formtype === 'forgot';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Form submitted:', formInfos);
    };

    return (
        <div className="min-h-screen bg-[#f4fdf8] flex flex-col justify-center items-center p-6 sm:p-8">
            
            <div className="w-full max-w-md">
                
               

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8">

           <img src="/Sliqpayvisual12.png"
            alt="SliqPay"
            className="h-10 sm:h-12 mx-auto mb-6"
        />   
                    <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
                    <p className="text-sm text-gray-600">{subtitle}</p>
                </div>
                        {isSignup && (
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00A86B] focus:border-transparent transition"
                                        placeholder="John"
                                        value={formInfos.fname}
                                        onChange={(e) => setFormInfos({ ...formInfos, fname: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00A86B] focus:border-transparent transition"
                                        placeholder="Doe"
                                        value={formInfos.lname}
                                        onChange={(e) => setFormInfos({ ...formInfos, lname: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00A86B] focus:border-transparent transition"
                                placeholder="john@example.com"
                                value={formInfos.email}
                                onChange={(e) => setFormInfos({ ...formInfos, email: e.target.value })}
                            />
                        </div>

                        {isSignup && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00A86B] focus:border-transparent transition"
                                    placeholder="+234 800 000 0000"
                                    value={formInfos.phone}
                                    onChange={(e) => setFormInfos({ ...formInfos, phone: e.target.value })}
                                />
                            </div>
                        )}

                        {(isLogin || isSignup) && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    {isLogin && (
                                        <a href="/auth/forgot-password" className="text-xs text-[#00A86B] hover:underline">
                                            Forgot password?
                                        </a>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00A86B] focus:border-transparent transition"
                                    placeholder={isSignup ? "Create a strong password" : "Enter your password"}
                                    value={formInfos.password}
                                    onChange={(e) => setFormInfos({ ...formInfos, password: e.target.value })}
                                />
                                {isSignup && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Must be at least 8 characters with a number and a special character
                                    </p>
                                )}
                            </div>
                        )}

                        {isSignup && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00A86B] focus:border-transparent transition"
                                    placeholder="Confirm your password"
                                    value={formInfos.cPassword}
                                    onChange={(e) => setFormInfos({ ...formInfos, cPassword: e.target.value })}
                                />
                            </div>
                        )}

                        {isSignup && (
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Referral Code <span className="text-gray-400">(Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00A86B] focus:border-transparent transition"
                                    placeholder="Enter referral code to earn bonus"
                                    value={formInfos.refCode}
                                    onChange={(e) => setFormInfos({ ...formInfos, refCode: e.target.value })}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-[#00A86B] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#008f5a] transition-colors"
                        >
                            {isSignup ? 'Create Account' : isLogin ? 'Sign In' : 'Reset Password'}
                        </button>

                        {isLogin && (
                            <p className="mt-6 text-center text-sm text-gray-600">
                                Don't have an account?{' '}
                                <a href="/auth/signup" className="text-[#00A86B] font-medium hover:underline">
                                    Sign up
                                </a>
                            </p>
                        )}

                        {isSignup && (
                            <p className="mt-6 text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <a href="/auth/login" className="text-[#00A86B] font-medium hover:underline">
                                    Sign in
                                </a>
                            </p>
                        )}

                        {isForgot && (
                            <p className="mt-6 text-center text-sm text-gray-600">
                                Remembered your password?{' '}
                                <a href="/auth/login" className="text-[#00A86B] font-medium hover:underline">
                                    Back to sign in
                                </a>
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
