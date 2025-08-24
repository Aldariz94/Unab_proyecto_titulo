const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loanSchema = new Schema({
    usuarioId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, required: true },
    
    // --- INICIO DE LA CORRECCIÓN ---
    // El valor para una instancia de recurso debe ser 'ResourceInstance'.
    // Estaba incorrectamente como 'ResourceCRA'.
    itemModel: { type: String, required: true, enum: ['Exemplar', 'ResourceInstance'] },
    // --- FIN DE LA CORRECCIÓN ---

    fechaInicio: { type: Date, default: Date.now, required: true },
    fechaVencimiento: { type: Date, required: true },
    fechaDevolucion: { type: Date },
    estado: { 
        type: String, 
        required: true, 
        enum: ['enCurso', 'devuelto', 'atrasado'],
        default: 'enCurso'
    }
}, { timestamps: true });

loanSchema.virtual('itemDetails', {
    ref: doc => doc.itemModel,
    localField: 'item',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('Loan', loanSchema);