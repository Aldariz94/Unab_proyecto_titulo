// backend/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
// 1. Importa la nueva función
const { getItemsForAttention, deleteItemInstance } = require('../controllers/inventoryController'); 
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/attention', [authMiddleware, checkRole(['admin'])], getItemsForAttention);

// 2. Añade la nueva ruta DELETE
// @route   DELETE api/inventory/item/:itemModel/:itemId
// @desc    Dar de baja (eliminar) una copia específica de un ítem
// @access  Private (Admin)
router.delete('/item/:itemModel/:itemId', [authMiddleware, checkRole(['admin'])], deleteItemInstance);

module.exports = router;