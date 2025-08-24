const express = require('express');
const router = express.Router();
const { createResource, getResources, updateResource, deleteResource, addInstances, getInstancesForResource, updateInstanceStatus } = require('../controllers/resourceController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// ... (rutas POST, PUT, DELETE, GET existentes sin cambios)
router.post('/', [authMiddleware, checkRole(['admin'])], createResource);
router.put('/:id', [authMiddleware, checkRole(['admin'])], updateResource);
router.delete('/:id', [authMiddleware, checkRole(['admin'])], deleteResource);
router.get('/', [authMiddleware, checkRole(['admin', 'profesor'])], getResources);

// --- NUEVAS RUTAS ---
router.post('/:id/instances', [authMiddleware, checkRole(['admin'])], addInstances);
router.get('/:id/instances', [authMiddleware, checkRole(['admin'])], getInstancesForResource);
router.put('/instances/:instanceId', [authMiddleware, checkRole(['admin'])], updateInstanceStatus);

module.exports = router;