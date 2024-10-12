import jwt from "jsonwebtoken";
import { JWT_SECRET } from "$env/static/private";

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
