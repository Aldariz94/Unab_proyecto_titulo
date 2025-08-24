// backend/routes/importRoutes.js
const express = require('express');
const router = express.Router();
const { importUsers, importBooks, importResources } = require('../controllers/importController'); // <-- 1. Importa la nueva función
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   POST api/import/users
// @desc    Importar usuarios desde un archivo Excel
// @access  Private (Admin)
router.post('/users', [authMiddleware, checkRole(['admin'])], upload.single('file'), importUsers);

// @route   POST api/import/books
// @desc    Importar libros desde un archivo Excel
// @access  Private (Admin)
router.post('/books', [authMiddleware, checkRole(['admin'])], upload.single('file'), importBooks);

// @route   POST api/import/resources
// @desc    Importar recursos desde un archivo Excel
// @access  Private (Admin)
router.post('/resources', [authMiddleware, checkRole(['admin'])], upload.single('file'), importResources); // <-- 2. AÑADE ESTA LÍNEA

module.exports = router;