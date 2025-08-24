const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resourceCRASchema = new Schema({
    nombre: { type: String, required: true, index: true },
    categoria: { type: String, required: true, enum: ['tecnologia', 'juego', 'pedagogico', 'otro'] },
    sede: {
        type: String,
        required: [true, 'La sede es un campo obligatorio.'],
        enum: ['Media', 'Basica']
    },
    descripcion: { type: String },
    ubicacion: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ResourceCRA', resourceCRASchema);
