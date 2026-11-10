import jwt from "jsonwebtoken";
import { ERR_UNAUTHORIZED, ERR_FORBIDDEN, ERR_INVALID_TOKEN } from "../configs/constants.js";

function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return null;
    return authHeader.slice(7);
}

export function requireUser(req, res, next) {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: ERR_UNAUTHORIZED });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: ERR_INVALID_TOKEN });
    }
}

export function requireAdmin(req, res, next) {
    const token = extractToken(req);
    if (!token) return res.status(403).json({ message: ERR_FORBIDDEN });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.role !== "admin") return res.status(403).json({ message: ERR_FORBIDDEN });
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ message: ERR_INVALID_TOKEN });
    }
}
