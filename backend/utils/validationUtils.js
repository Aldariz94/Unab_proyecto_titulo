const Loan = require('../models/Loan');
const Reservation = require('../models/Reservation');
const Exemplar = require('../models/Exemplar');
const ResourceInstance = require('../models/ResourceInstance');

const checkBorrowingLimits = async (user, itemToBorrow) => {
    const { _id: userId, rol } = user;
    const { itemId, itemModel } = itemToBorrow;

    const activeLoans = await Loan.find({ usuarioId: userId, estado: 'enCurso' }).lean();
    const activeReservations = await Reservation.find({ usuarioId: userId, estado: 'pendiente' }).lean();
    const allUserItems = [...activeLoans, ...activeReservations];

    switch (rol) {
        case 'alumno':
            if (itemModel !== 'Exemplar') {
                return { valid: false, message: 'Los alumnos solo pueden solicitar libros.' };
            }
            if (allUserItems.length >= 1) {
                return { valid: false, message: 'Los alumnos pueden tener un máximo de 1 ítem (entre préstamos y reservas).' };
            }
            break;

        case 'personal':
            const hasBook = allUserItems.some(item => item.itemModel === 'Exemplar');
            const hasResource = allUserItems.some(item => item.itemModel === 'ResourceInstance');

            if (itemModel === 'Exemplar' && hasBook) {
                return { valid: false, message: 'El personal puede tener un máximo de 1 libro.' };
            }
            if (itemModel === 'ResourceInstance' && hasResource) {
                return { valid: false, message: 'El personal puede tener un máximo de 1 recurso.' };
            }
            break;

        case 'profesor':
            const requestedItem = itemModel === 'Exemplar'
                ? await Exemplar.findById(itemId).select('libroId').lean()
                : await ResourceInstance.findById(itemId).select('resourceId').lean();
            
            if (!requestedItem) {
                return { valid: false, message: 'El ítem solicitado no fue encontrado.' };
            }

            const requestedBaseId = (requestedItem.libroId || requestedItem.resourceId).toString();

            for (const item of allUserItems) {
                const userItem = item.itemModel === 'Exemplar'
                    ? await Exemplar.findById(item.item).select('libroId').lean()
                    : await ResourceInstance.findById(item.item).select('resourceId').lean();
                
                if (userItem) {
                    const userBaseId = (userItem.libroId || userItem.resourceId).toString();
                    if (userBaseId === requestedBaseId) {
                        return { valid: false, message: 'Este profesor ya tiene una copia de este ítem en préstamo o reserva.' };
                    }
                }
            }
            break;
    }

    return { valid: true };
};

module.exports = { checkBorrowingLimits };