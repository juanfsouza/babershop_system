import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || '';

export const generateToken = (user: { id: number; email: string; role: string }) => {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '1d',
    });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
}

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10)
}

export const comparePassword = async (password: string, hashPassword: string) => {
    return await bcrypt.compare(password, hashPassword)
}