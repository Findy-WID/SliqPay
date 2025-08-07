   import { z } from "zod";

   export const RegisterSchema = z.object({
        fname: z.string().min(3).max(15),
        lname: z.string().min(3).max(15),
        email: z.string(),
        phone: z.string(),
        password: z.string().min(5),
        cPassword: z.string().min(5),
        refCode: z.string().min(5),
    }) .refine((data) => data.password === data.cPassword, {
            message: "Passwords do not match",
            path: ["cPassword"]
        })