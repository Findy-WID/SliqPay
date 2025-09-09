import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../users/repositories/user.repository.js';
import { env } from '../../../config/env.js';
function sign(userId) {
    return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '15m' });
}
export function publicUser(u) {
    return { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, createdAt: u.createdAt };
}
export function signup(fname, lname, email, password) {
    if (UserRepository.findByEmail(email)) {
        throw { status: 400, message: 'Email already registered' };
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = UserRepository.create({ email, firstName: fname, lastName: lname, passwordHash });
    const token = sign(user.id);
    return { user: publicUser(user), token };
}
export function login(email, password) {
    const user = UserRepository.findByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        throw { status: 401, message: 'Invalid credentials' };
    }
    const token = sign(user.id);
    return { user: publicUser(user), token };
}
