import jwt from "jsonwebtoken";
import { User } from "../model/users.js";
import { checkPwd, hashedPwd } from "../utils/hash.js";
import { JWT_EXPIRES_IN } from "../configs/constants.js";
import { AppError } from "../middleware/errorHandler.js";

function signToken(uid, role) {
    return jwt.sign({ uid, role }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function loginUser(username, password) {
    const user = await User.findOne({ username });
    if (!user) return null;

    const valid = checkPwd(password, user.pwd);
    if (!valid) return null;

    const userData = { uid: user.uid, username: user.username, email: user.email, role: user.role };
    const token = signToken(user.uid, user.role);
    return { user: userData, token };
}

export async function registerUser(username, password, email) {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        throw new AppError(
            existingUser.username === username ? "Username already taken" : "Email already in use",
            400
        );
    }

    const hashedPassword = hashedPwd(password);
    const uid = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

    const newUser = await User.create({ uid, username, pwd: hashedPassword, email, role: "user" });
    const userData = { uid: newUser.uid, username: newUser.username, email: newUser.email, role: newUser.role };
    const token = signToken(newUser.uid, newUser.role);
    return { user: userData, token };
}

export default { loginUser, registerUser };
