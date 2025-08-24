const express = require('express');
const router = express.Router();
const { getPublicCatalog, getUserBookCatalog, getUserResourceCatalog } = require('../controllers/publicController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta pública para visitantes
router.get('/catalog', getPublicCatalog);

// Nuevas rutas para usuarios logueados
router.get('/user-catalog/books', authMiddleware, getUserBookCatalog);
router.get('/user-catalog/resources', authMiddleware, getUserResourceCatalog);

module.exports = router;