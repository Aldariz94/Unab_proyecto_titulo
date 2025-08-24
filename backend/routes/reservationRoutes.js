const express = require('express');
const router_reservations = express.Router();
const {
    createReservation,
    getActiveReservations,
    confirmReservation,
    cancelReservation,
    getMyReservations,
    cancelMyReservation
} = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// --- Rutas para el usuario ---
router_reservations.get('/my-reservations', authMiddleware, getMyReservations);
router_reservations.delete('/:id', authMiddleware, cancelMyReservation);

// --- Rutas para el administrador ---
router_reservations.post('/', authMiddleware, createReservation);
router_reservations.get('/', [authMiddleware, checkRole(['admin'])], getActiveReservations);
router_reservations.post('/:id/confirm', [authMiddleware, checkRole(['admin'])], confirmReservation);

// CORRECCIÓN: Se usó 'router_post' en lugar de 'router_reservations.post'
router_reservations.post('/:id/cancel', [authMiddleware, checkRole(['admin'])], cancelReservation);

module.exports = router_reservations;