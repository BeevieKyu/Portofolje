import { param, body } from "express-validator";
import { checkUserExists, checkUsernameExists } from "../services/user.service.js";
import {
    MIN_USERNAME_LENGTH,
    MAX_USERNAME_LENGTH,
    MIN_PWD_LENGTH,
    MAX_PWD_LENGTH,
} from "../configs/constants.js";

export function validateUid() {
    return [
        param("uid")
            .isInt({ min: 0, max: Number.MAX_SAFE_INTEGER })
            .withMessage("User IDs must be a non-negative integer")
            .bail()
            .toInt()
            .custom(checkUserExists)
            .withMessage("No user found with that ID"),
    ];
}

export function validateLogin() {
    return [
        body("username")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Username is required")
            .isAlphanumeric()
            .withMessage("Username must contain only alphanumeric characters")
            .isLength({ min: MIN_USERNAME_LENGTH, max: MAX_USERNAME_LENGTH })
            .withMessage(`Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ max: MAX_PWD_LENGTH })
            .withMessage(`Password must not exceed ${MAX_PWD_LENGTH} characters`),
    ];
}

export function validateRegister() {
    return [
        body("username")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Username is required")
            .isAlphanumeric()
            .withMessage("Username must contain only alphanumeric characters")
            .isLength({ min: MIN_USERNAME_LENGTH, max: MAX_USERNAME_LENGTH })
            .withMessage(`Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: MIN_PWD_LENGTH, max: MAX_PWD_LENGTH })
            .withMessage(`Password must be between ${MIN_PWD_LENGTH} and ${MAX_PWD_LENGTH} characters`),

        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .normalizeEmail()
            .isEmail()
            .withMessage("A valid email address is required"),
    ];
}

export function validateUser() {
    return [
        body("username")
            .trim()
            .escape()
            .isAlphanumeric()
            .withMessage("Username may only contain alphanumeric characters")
            .isLength({ min: MIN_USERNAME_LENGTH, max: MAX_USERNAME_LENGTH })
            .withMessage(`Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`)
            .bail()
            .custom(async (username) => {
                const taken = await checkUsernameExists(username);
                if (taken) throw new Error("Username is already taken");
            }),

        body("pwd")
            .trim()
            .isStrongPassword({
                minLength: MIN_PWD_LENGTH,
                minLowercase: 2,
                minUppercase: 2,
                minNumbers: 2,
                minSymbols: 2,
            })
            .withMessage(
                `Password must be ${MIN_PWD_LENGTH}+ characters with at least 2 lowercase, 2 uppercase, 2 numbers, and 2 symbols`
            ),

        body("email")
            .trim()
            .normalizeEmail()
            .isEmail()
            .withMessage("A valid email address is required"),
    ];
}

export default { validateUid, validateLogin, validateRegister, validateUser };
