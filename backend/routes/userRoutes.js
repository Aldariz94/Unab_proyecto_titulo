const express = require('express');
const router = express.Router();
const { createUser, getUsers, updateUser, deleteUser, getSanctionedUsers, removeSanction, getMe } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// --- NUEVA RUTA (debe ir antes de las rutas con /:id para evitar conflictos) ---
router.get('/me', authMiddleware, getMe);

// Rutas existentes
router.post('/', [authMiddleware, checkRole(['admin'])], createUser);
router.get('/', [authMiddleware, checkRole(['admin'])], getUsers);
router.get('/sanctioned', [authMiddleware, checkRole(['admin'])], getSanctionedUsers);
router.put('/:id', [authMiddleware, checkRole(['admin'])], updateUser);
router.delete('/:id', [authMiddleware, checkRole(['admin'])], deleteUser);
router.put('/:id/remove-sanction', [authMiddleware, checkRole(['admin'])], removeSanction);

module.exports = router;