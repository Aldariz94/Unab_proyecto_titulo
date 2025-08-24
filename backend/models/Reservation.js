const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    usuarioId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, required: true },
    itemModel: { type: String, required: true, enum: ['Exemplar', 'ResourceInstance'] },
    fechaReserva: { type: Date, default: Date.now },
    expiraEn: { type: Date, required: true },
    estado: { 
        type: String, 
        required: true, 
        // CAMBIO: Se añade 'cancelada' a la lista de valores permitidos
        enum: ['pendiente', 'expirada', 'completada', 'cancelada'],
        default: 'pendiente'
    }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);