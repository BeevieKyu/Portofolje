import crypto from "node:crypto";

const { APP_SALT: salt } = process.env;

export function hashedPwd(pwd){
    const s2hash = pwd + salt;
    return crypto.createHash("md5").update(s2hash).digest("hex").toString();
}

export function checkPwd(pwd, existingHash){
    return hashedPwd(pwd) === existingHash;
}