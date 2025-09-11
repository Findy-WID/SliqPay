import { z } from 'zod';
export const signupSchema = z.object({
    body: z.object({
        fname: z.string().min(1),
        lname: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6)
    })
});
export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1)
    })
});
