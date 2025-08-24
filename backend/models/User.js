/*
 * ----------------------------------------------------------------
 * backend/models/User.js (CORREGIDO)
 * Se reemplaza 'hashContraseña' por 'hashedPassword'.
 * ----------------------------------------------------------------
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    primerNombre: { type: String, required: true },
    segundoNombre: { type: String },
    primerApellido: { type: String, required: true },
    segundoApellido: { type: String },
    rut: { type: String, required: true, unique: true },
    correo: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true }, // CAMBIO AQUÍ
    rol: { 
        type: String, 
        required: true, 
        enum: ['admin', 'profesor', 'alumno', 'personal', 'visitante'] 
    },
    curso: { type: String },
    sancionHasta: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);