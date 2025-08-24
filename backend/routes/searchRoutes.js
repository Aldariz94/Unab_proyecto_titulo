const express = require('express');
const router = express.Router();
const { searchUsers, searchAvailableItems, searchAllBooks, findAvailableCopy, searchStudents } = require('../controllers/searchController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/users', [authMiddleware, checkRole(['admin'])], searchUsers);
router.get('/items', [authMiddleware, checkRole(['admin'])], searchAvailableItems);
router.get('/all-books', [authMiddleware, checkRole(['admin', 'profesor'])], searchAllBooks);

// --- NUEVA RUTA ---
// Requiere estar logueado, pero no un rol específico
router.get('/find-available-copy/:itemType/:baseItemId', authMiddleware, findAvailableCopy);
router.get('/students', [authMiddleware, checkRole(['admin', 'profesor'])], searchStudents);

module.exports = router;