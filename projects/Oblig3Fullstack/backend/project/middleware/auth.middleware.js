/**
 * reads x-user-role header, stores it, is no role is privided default is anonymous. 
 * makes the user role available for middlware and route handlers
 */
export function setUserRole(req, res, next) {
  const role = req.headers['x-user-role'];
  req.userRole = role || 'anonymous';
  next();
}

/**
 * checks id the user is admin
 * if no, stops the req and retunrd 403.
 */
export function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' });
  }

  next();
}

/**
 * checks what the role of the user is, if there is none return 403
 */
export function requireUser(req, res, next) {
  if (req.userRole !== 'user' && req.userRole !== 'admin') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'You need to be logged in' });
  }

  next();
}

export default setUserRole;
