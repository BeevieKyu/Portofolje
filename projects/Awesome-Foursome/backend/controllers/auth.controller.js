import authServices from "../services/auth.service.js";
import { ERR_INVALID_CREDENTIALS } from "../configs/constants.js";

export async function login(req, res, next) {
    try {
        const { username, password } = req.validData;
        const result = await authServices.loginUser(username, password);
        if (!result) return res.status(401).json({ message: ERR_INVALID_CREDENTIALS });
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function register(req, res, next) {
    try {
        const { username, password, email } = req.validData;
        const result = await authServices.registerUser(username, password, email);
        return res.status(201).json({ message: "Registration successful", ...result });
    } catch (error) {
        next(error);
    }
}

export default { login, register };
