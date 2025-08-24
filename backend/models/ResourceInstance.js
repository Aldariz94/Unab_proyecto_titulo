const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resourceInstanceSchema = new Schema({
    resourceId: { type: Schema.Types.ObjectId, ref: 'ResourceCRA', required: true },
    codigoInterno: { type: String, required: true, unique: true },
    estado: { 
        type: String, 
        required: true, 
        enum: ['disponible', 'prestado', 'mantenimiento', 'reservado'],
        default: 'disponible'
    },
    observaciones: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ResourceInstance', resourceInstanceSchema);