const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    // Datos Principales (requeridos)
    tipoDocumento: { type: String, required: true },
    titulo: { type: String, required: true, index: true },
    autor: { type: String, required: true, index: true },
    lugarPublicacion: { type: String, required: true },
    editorial: { type: String, required: true },
    sede: { // NUEVO CAMPO
        type: String,
        required: [true, 'La sede es un campo obligatorio.'],
        enum: ['Media', 'Basica']
    },
    // Datos Adicionales (opcionales)
    pais: { type: String, default: 'Chile' },
    numeroPaginas: { type: Number },
    descriptores: [String],
    idioma: { type: String },
    isbn: { type: String, unique: true, sparse: true },
    cdd: { type: String },
    añoPublicacion: { type: Number },
    edicion: { type: String },
    ubicacionEstanteria: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);