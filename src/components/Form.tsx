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

    return (
        <div className="min-h-screen bg-[#f4fdf8] flex flex-col justify-center items-center p-6 space-y-12">
        <img
            src="/Sliqpayvisual12.png"
            alt="SliqPay"
            className="h-12 mx-auto mb-4"
        />   
        <form className="px-8 pt-6 pb-12 mb-4 w-full max-w-md bg-white shadow-md rounded-lg">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">{title}</h1>
                <p className="text-sm text-gray-600">{subtitle}</p>
            </div>

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
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
                placeholder="+234 800 000 0000"
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
                className="w-full border rounded px-3 py-2"
                placeholder="Create a strong password"
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
                className="w-full border rounded px-3 py-2"
                placeholder="Confirm your password"
                value={formInfos.cPassword}
                onChange={(e) =>
                    setFormInfos({ ...formInfos, cPassword: e.target.value })
                }
                />
            </div>
            )}

            {showField("refCode") && (
            <div className="mb-6">
                <label className="block text-gray-700 text-sm mb-2">
                Referral Code (Optional)
                </label>
                <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Enter referral code to earn bonus"
                value={formInfos.refCode}
                onChange={(e) =>
                    setFormInfos({ ...formInfos, refCode: e.target.value })
                }
                />
            </div>
            )}

            <button
                type="submit"
                className="w-full bg-[#00A86B] text-white py-2 rounded hover:bg-[#008f5a] transition"
            >
                {formtype === "signup"
                    ? "Sign Up"
                    : formtype === "login"
                    ? "Login"
                    : "Reset Password"
                }
            </button>
        </form>
        </div>
    );
}
