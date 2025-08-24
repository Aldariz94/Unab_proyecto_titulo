// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// @route   GET api/dashboard/stats
// @desc    Obtener estadísticas para el panel de administración
// @access  Private (Admin)
router.get('/stats', [authMiddleware, checkRole(['admin'])], getDashboardStats);

module.exports = router;