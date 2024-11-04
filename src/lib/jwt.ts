import jwt from "jsonwebtoken";
import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";

const { JWT_SECRET } = dev ? env : (process.env as any);

export const GenerateToken = (payload: object) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

export const VerifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};
