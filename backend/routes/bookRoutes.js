const express = require('express');
const router = express.Router();
const { createBook, getBooks, getBookDetails, updateBook, deleteBook, addExemplars, getExemplarsForBook, updateExemplarStatus } = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// ... (rutas POST, PUT, DELETE, GET existentes sin cambios)
router.post('/', [authMiddleware, checkRole(['admin'])], createBook);
router.put('/:id', [authMiddleware, checkRole(['admin'])], updateBook);
router.delete('/:id', [authMiddleware, checkRole(['admin'])], deleteBook);
router.get('/', getBooks);
router.get('/:id', authMiddleware, getBookDetails);

// --- NUEVAS RUTAS ---
router.post('/:id/exemplars', [authMiddleware, checkRole(['admin'])], addExemplars);
router.get('/:id/exemplars', [authMiddleware, checkRole(['admin'])], getExemplarsForBook);
router.put('/exemplars/:exemplarId', [authMiddleware, checkRole(['admin'])], updateExemplarStatus);

module.exports = router;