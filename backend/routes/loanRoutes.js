const express = require('express');
const router = express.Router();
// Se añade getMyLoans a la lista de importaciones
const { createLoan, returnLoan, getAllLoans, getLoansByUser, renewLoan, getMyLoans, getOverdueLoans } = require('../controllers/loanController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// --- NUEVA RUTA ---
// @route   GET api/loans/my-loans
// @desc    Obtener los préstamos del usuario actual
// @access  Private
router.get('/my-loans', authMiddleware, getMyLoans);


// --- Tus rutas existentes (sin cambios) ---
router.post('/', [authMiddleware, checkRole(['admin'])], createLoan);
router.post('/return/:loanId', [authMiddleware, checkRole(['admin'])], returnLoan);
router.get('/', [authMiddleware, checkRole(['admin'])], getAllLoans);
router.get('/user/:userId', [authMiddleware, checkRole(['admin'])], getLoansByUser);
router.put('/:id/renew', [authMiddleware, checkRole(['admin'])], renewLoan);
router.get('/overdue', [authMiddleware, checkRole(['admin'])], getOverdueLoans);

module.exports = router;