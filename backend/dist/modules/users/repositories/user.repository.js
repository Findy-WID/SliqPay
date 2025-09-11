import { randomUUID } from 'crypto';
const users = [];
export const UserRepository = {
    findByEmail(email) {
        return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    },
    findById(id) {
        return users.find(u => u.id === id) || null;
    },
    create(data) {
        const user = { id: randomUUID(), createdAt: new Date(), ...data };
        users.push(user);
        return user;
    }
};
