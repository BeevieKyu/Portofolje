import User from '../models/User.js';
import { checkPwd, hashpwd } from '../utils/hash.js';

/**
 * checks if email or username already exists with $or, if found throws a 409 error
 * Hashes the incoming password
 * creates a user in mongoDB
 * returns a safe response object(publid id, username, email and user type. NOT pwd)
 */
export const registerUser = async ({ username, email, password, age }) => {
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    const error = new Error('User with this email or username already exists');
    error.status = 409;
    throw error;
  }

  const passwordHash = hashpwd(password);
  const passwordSalt = 'app-salt-env';

  const user = await User.create({ username, email, passwordHash, passwordSalt, age });

  return {
    id: user.publicId,
    username: user.username,
    email: user.email,
    userType: user.userType,
    appearancePreferences: user.appearancePreferences,
  };
};

/**
 * finds user by email if no user it throws 401.
 * Validates password in two modules
 *  legacy plaintext and normal hashes mode.
 * if the password is invalid it throws a 401.
 * Utdates the lastLogin
 * returns success message and publig user info.
 */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const isLegacyPlaintext = user.passwordSalt === 'not-used';
  const isValidPassword = isLegacyPlaintext
    ? password === user.passwordHash
    : checkPwd(password, user.passwordHash);

  if (!isValidPassword) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  user.lastLogin = new Date();
  await user.save();

  return { 
    message: 'Login successful. Use the x-user-role header for protected routes.',
    user: {
      id: user.publicId,
      username: user.username,
      email: user.email,
      userType: user.userType,
      appearancePreferences: user.appearancePreferences,
    }
  };
};
