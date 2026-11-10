import express from 'express';
import { registerController, loginController, getUserController, updateUserController, protectedController, listUsersController, banUserController } from '../controllers/user.controller.js';
import { requireAdmin, requireUser, setUserRole } from '../middleware/auth.middleware.js';
import { validateLogin, validatePagination, validateRegister, validateUserUpdate } from '../validators/validate.js';

const router = express.Router();

router.post('/register', validateRegister, registerController);
router.post('/login', validateLogin, loginController);
router.get('/protected', setUserRole, requireUser, protectedController);
router.get('/', setUserRole, requireAdmin, validatePagination, listUsersController);
router.patch('/:id/ban', setUserRole, requireAdmin, banUserController);

router.get('/:id', setUserRole, getUserController);
router.patch('/:id', setUserRole, requireUser, validateUserUpdate, updateUserController);

export default router;
