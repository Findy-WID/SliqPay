import { login, signup, publicUser } from '../services/auth.service.js';
import { env } from '../../../config/env.js';
export const handleSignup = (req, res) => {
    const { fname, lname, email, password } = req.body;
    const { user, token } = signup(fname, lname, email, password);
    res.cookie('accessToken', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000
    }).status(201).json({ user });
};
export const handleLogin = (req, res) => {
    const { email, password } = req.body;
    const { user, token } = login(email, password);
    res.cookie('accessToken', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000
    }).json({ user });
};
export const handleLogout = (_req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production'
    }).status(204).send();
};
export const handleMe = (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized' });
    res.json({ user: publicUser(req.user) });
};
