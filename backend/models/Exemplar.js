const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exemplarSchema = new Schema({
    libroId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    numeroCopia: { type: Number, required: true },
    codigoBarras: { type: String, unique: true, sparse: true },
    estado: { 
        type: String, 
        required: true, 
        enum: ['disponible', 'prestado', 'reservado', 'deteriorado', 'extraviado'],
        default: 'disponible'
    },
    observaciones: { type: String, default: '' }, 
    ubicacion: { type: String },
    fechaAdquisicion: { type: Date }
}, { timestamps: true });

exemplarSchema.index({ libroId: 1, numeroCopia: 1 }, { unique: true });

module.exports = mongoose.model('Exemplar', exemplarSchema);