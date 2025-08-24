const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Exemplar = require('../models/Exemplar');
const ResourceInstance = require('../models/ResourceInstance');
const Loan = require('../models/Loan');
const { addBusinessDays } = require('../utils/dateUtils');
const { checkBorrowingLimits } = require('../utils/validationUtils'); // <-- Se importa el nuevo ayudante

exports.createReservation = async (req, res) => {
    const { usuarioId, itemId, itemModel } = req.body;
    const finalUserId = (req.user.rol === 'admin' && usuarioId) ? usuarioId : req.user.id;

    if (!mongoose.Types.ObjectId.isValid(finalUserId) || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ msg: 'ID de usuario o de ítem no válido.' });
    }
    try {
        const user = await User.findById(finalUserId);
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado.' });
        if (user.sancionHasta && new Date(user.sancionHasta) > new Date()) {
            return res.status(403).json({ msg: `Usuario sancionado hasta ${user.sancionHasta.toLocaleDateString()}`});
        }
        
        const validation = await checkBorrowingLimits(user, { itemId, itemModel });
        if (!validation.valid) {
            return res.status(403).json({ msg: validation.message });
        }

        const ItemModel = itemModel === 'Exemplar' ? Exemplar : ResourceInstance;
        const item = await ItemModel.findById(itemId);
        if (!item || item.estado !== 'disponible') {
            return res.status(400).json({ msg: 'Este ítem no está disponible para reservar en este momento.' });
        }
        const expiraEn = addBusinessDays(new Date(), 2);
        const newReservation = new Reservation({
            usuarioId: finalUserId,
            item: itemId,
            itemModel,
            expiraEn,
            estado: 'pendiente'
        });
        item.estado = 'reservado';
        await item.save();
        await newReservation.save();
        res.status(201).json({ msg: 'Reserva creada exitosamente. Tiene 2 días hábiles para retirar el ítem.', reservation: newReservation });
    } catch (err) {
        console.error("Error al crear la reserva:", err.message);
        res.status(500).send('Error del servidor');
    }
};

// --- INICIO DE LA CORRECCIÓN ---
exports.getActiveReservations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { estado: 'pendiente' };

        const totalReservations = await Reservation.countDocuments(query);
        const totalPages = Math.ceil(totalReservations / limit);

        const reservations = await Reservation.find(query)
            .populate('usuarioId', 'primerNombre primerApellido')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const formattedReservations = await Promise.all(reservations.map(async (doc) => {
            let itemDetails = { name: 'Detalles no disponibles' };
            if (doc.itemModel === 'Exemplar') {
                const exemplar = await Exemplar.findById(doc.item).populate('libroId', 'titulo');
                if (exemplar && exemplar.libroId) {
                    itemDetails = { name: `${exemplar.libroId.titulo} (Copia #${exemplar.numeroCopia})` };
                }
            } else if (doc.itemModel === 'ResourceInstance') {
                const instance = await ResourceInstance.findById(doc.item).populate('resourceId', 'nombre');
                if (instance && instance.resourceId) {
                    itemDetails = { name: `${instance.resourceId.nombre} (${instance.codigoInterno})` };
                }
            }
            return { ...doc, itemDetails };
        }));

        res.json({
            docs: formattedReservations,
            totalDocs: totalReservations,
            totalPages,
            page
        });
    } catch (err) {
        console.error("Error en getActiveReservations:", err.message);
        res.status(500).send('Error del servidor');
    }
};
// --- FIN DE LA CORRECCIÓN ---

// Confirmar el retiro de una reserva
exports.confirmReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation || reservation.estado !== 'pendiente') {
            return res.status(404).json({ msg: 'Reserva no encontrada o ya no está pendiente.' });
        }
        let fechaVencimiento;
        if (reservation.itemModel === 'Exemplar') {
            fechaVencimiento = addBusinessDays(new Date(), 10);
        } else {
            fechaVencimiento = new Date();
            fechaVencimiento.setHours(18, 0, 0, 0);
        }
        const newLoan = new Loan({
            usuarioId: reservation.usuarioId,
            item: reservation.item,
            itemModel: reservation.itemModel,
            fechaVencimiento: fechaVencimiento,
        });
        await newLoan.save();
        const ItemModel = reservation.itemModel === 'Exemplar' ? Exemplar : ResourceInstance;
        await ItemModel.findByIdAndUpdate(reservation.item, { estado: 'prestado' });
        reservation.estado = 'completada';
        await reservation.save();
        res.json({ msg: 'Reserva confirmada y préstamo creado exitosamente.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// Cancelar una reserva pendiente
exports.cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation || reservation.estado !== 'pendiente') {
            return res.status(404).json({ msg: 'Reserva no encontrada o ya no está pendiente.' });
        }
        const ItemModel = reservation.itemModel === 'Exemplar' ? Exemplar : ResourceInstance;
        await ItemModel.findByIdAndUpdate(reservation.item, { estado: 'disponible' });
        reservation.estado = 'cancelada';
        await reservation.save();
        res.json({ msg: 'Reserva cancelada exitosamente.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// --- NUEVAS FUNCIONES PARA EL USUARIO ---

// Obtener las reservas del usuario autenticado
exports.getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ 
            usuarioId: req.user.id, 
            estado: 'pendiente' 
        }).lean();

        // --- INICIO DE LA CORRECCIÓN ---
        const populatedReservations = await Promise.all(reservations.map(async (reservation) => {
            let itemDetails = null; // Inicia como null
            if (reservation.itemModel === 'Exemplar') {
                const exemplar = await Exemplar.findById(reservation.item).populate('libroId', 'titulo');
                if (exemplar && exemplar.libroId) {
                    // Envía 'titulo' directamente
                    itemDetails = { titulo: exemplar.libroId.titulo };
                }
            } else if (reservation.itemModel === 'ResourceInstance') {
                const instance = await ResourceInstance.findById(reservation.item).populate('resourceId', 'nombre');
                if (instance && instance.resourceId) {
                    // Envía 'nombre' directamente
                    itemDetails = { nombre: instance.resourceId.nombre };
                }
            }
            
            const expiraEnValida = reservation.expiraEn && !isNaN(new Date(reservation.expiraEn));

            return {
                ...reservation,
                itemDetails,
                expiraEn: expiraEnValida ? new Date(reservation.expiraEn).toLocaleDateString('es-CL') : 'Fecha inválida',
            };
        }));
        // --- FIN DE LA CORRECCIÓN ---

        res.json(populatedReservations);
    } catch (err) {
        console.error("Error en getMyReservations:", err.message);
        res.status(500).send('Error del servidor');
    }
};

// El usuario cancela su propia reserva
exports.cancelMyReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ msg: 'Reserva no encontrada.' });
        }
        // Verificar que la reserva pertenece al usuario que hace la petición
        if (reservation.usuarioId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'No autorizado para cancelar esta reserva.' });
        }
        if (reservation.estado !== 'pendiente') {
            return res.status(400).json({ msg: 'Esta reserva ya no se puede cancelar.' });
        }

        const ItemModel = reservation.itemModel === 'Exemplar' ? Exemplar : ResourceInstance;
        await ItemModel.findByIdAndUpdate(reservation.item, { estado: 'disponible' });
        
        reservation.estado = 'cancelada';
        await reservation.save();

        res.json({ msg: 'Reserva cancelada exitosamente.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};