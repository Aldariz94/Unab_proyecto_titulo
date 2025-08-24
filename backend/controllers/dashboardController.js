// backend/controllers/dashboardController.js
const Loan = require('../models/Loan');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Exemplar = require('../models/Exemplar');
const ResourceInstance = require('../models/ResourceInstance'); // Se agrega la importación que faltaba

exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

        // --- INICIO DE LA MODIFICACIÓN ---
        // Se define la consulta correcta para los préstamos atrasados.
        // Un préstamo está atrasado si su estado es 'enCurso' Y su fecha de vencimiento ya pasó.
        const overdueLoansQuery = {
            estado: 'enCurso',
            fechaVencimiento: { $lt: today }
        };
        // --- FIN DE LA MODIFICACIÓN ---

        const [
            loansToday,
            reservationsToday,
            overdueLoans,
            sanctionedUsers,
            itemsForAttention
        ] = await Promise.all([
            Loan.countDocuments({ fechaInicio: { $gte: startOfDay } }),
            Reservation.countDocuments({ fechaReserva: { $gte: startOfDay } }),
            Loan.countDocuments(overdueLoansQuery), // Se utiliza la nueva consulta aquí
            User.countDocuments({ sancionHasta: { $gt: new Date() } }),
            Exemplar.countDocuments({ estado: { $in: ['deteriorado', 'extraviado'] } })
        ]);

        res.json({
            loansToday,
            reservationsToday,
            overdueLoans,
            sanctionedUsers,
            itemsForAttention
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};