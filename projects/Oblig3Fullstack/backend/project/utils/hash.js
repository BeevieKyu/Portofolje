

import crypto from "node:crypto";
const { APP_SALT: salt } = process.env;

/**
 * this combines the password and salt, hashes with SHA-256 then returns a hex string.
 */
export function hashpwd(pwd) {
	const s2hash = pwd + salt;
	return crypto.createHash("sha256").update(s2hash).digest("hex");
}

/**
 * This hashes the probided pwd with hashpwd
 * compared resault to existingHash then returns true if they match, else false.
 */
export function checkPwd(pwd, existingHash) {
	return hashpwd(pwd) === existingHash;
}
