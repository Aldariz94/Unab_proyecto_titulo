const mongoose = require("mongoose");
const Loan = require("../models/Loan");
const User = require("../models/User");
const Exemplar = require("../models/Exemplar");
const ResourceInstance = require("../models/ResourceInstance");
const { addBusinessDays } = require("../utils/dateUtils");
const { checkBorrowingLimits } = require("../utils/validationUtils"); // <-- Se importa el nuevo ayudante

/**
 * --- NUEVA FUNCIÓN AUXILIAR ---
 * Formatea una lista de préstamos, poblando los detalles del ítem
 * y calculando dinámicamente si un préstamo está atrasado.
 * @param {Array} loans - Una lista de documentos de préstamo de Mongoose.
 * @returns {Promise<Array>} - Una promesa que resuelve a la lista de préstamos formateada.
 */

const formatAndCheckLoans = async (loans) => {
  const now = new Date();
  // Usamos Promise.all para ejecutar todas las búsquedas de detalles en paralelo
  return Promise.all(
    loans.map(async (loan) => {
      let dynamicStatus = loan.estado;

      // Lógica clave: Si el préstamo está 'enCurso' y su fecha de vencimiento ya pasó,
      // cambiamos dinámicamente su estado a 'atrasado' para la respuesta.
      if (loan.estado === "enCurso" && new Date(loan.fechaVencimiento) < now) {
        dynamicStatus = "atrasado";
      }

      let itemDetails = { titulo: 'Ítem Eliminado', nombre: 'Ítem Eliminado' };
      if (loan.itemModel === "Exemplar") {
        const exemplar = await Exemplar.findById(loan.item).populate(
          "libroId",
          "titulo"
        );
        if (exemplar && exemplar.libroId) {
          itemDetails = { titulo: exemplar.libroId.titulo };
        }
      } else if (loan.itemModel === "ResourceInstance") {
        const instance = await ResourceInstance.findById(loan.item).populate(
          "resourceId",
          "nombre"
        );
        if (instance && instance.resourceId) {
          itemDetails = { nombre: instance.resourceId.nombre };
        }
      }

      // Devolvemos una copia del préstamo con el estado dinámico y los detalles del ítem
      return { ...loan, estado: dynamicStatus, itemDetails };
    })
  );
};

exports.createLoan = async (req, res) => {
  const { usuarioId, itemId, itemModel } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(usuarioId) ||
    !mongoose.Types.ObjectId.isValid(itemId)
  ) {
    return res.status(400).json({ msg: "ID de usuario o de ítem no válido." });
  }

  try {
    const user = await User.findById(usuarioId);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado." });
    if (user.sancionHasta && new Date(user.sancionHasta) > new Date()) {
      return res
        .status(403)
        .json({
          msg: `Usuario sancionado hasta ${user.sancionHasta.toLocaleDateString()}`,
        });
    }

    const validation = await checkBorrowingLimits(user, { itemId, itemModel });
    if (!validation.valid) {
      return res.status(403).json({ msg: validation.message });
    }

    const ItemModel = itemModel === "Exemplar" ? Exemplar : ResourceInstance;
    const item = await ItemModel.findById(itemId);
    if (!item || item.estado !== "disponible") {
      return res
        .status(400)
        .json({ msg: "El ítem no está disponible para préstamo." });
    }

    let fechaVencimiento;
    if (itemModel === "Exemplar") {
      fechaVencimiento = addBusinessDays(new Date(), 10);
    } else {
      const ahora = new Date();
      const deadlineHoy = new Date();
      deadlineHoy.setHours(17, 0, 0, 0);
      if (ahora > deadlineHoy) {
        fechaVencimiento = addBusinessDays(new Date(), 1);
        fechaVencimiento.setHours(17, 0, 0, 0);
      } else {
        fechaVencimiento = deadlineHoy;
      }
    }

    const newLoan = new Loan({
      usuarioId,
      item: itemId,
      itemModel,
      fechaVencimiento,
    });
    await newLoan.save();
    item.estado = "prestado";
    await item.save();
    res.status(201).json(newLoan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

exports.returnLoan = async (req, res) => {
  const { loanId } = req.params;
  const { newStatus = "disponible", observaciones = "" } = req.body;

  const allowedStatus = ["disponible", "deteriorado", "extraviado"];
  if (!allowedStatus.includes(newStatus)) {
    return res.status(400).json({ msg: "Estado no válido." });
  }
  if (!mongoose.Types.ObjectId.isValid(loanId)) {
    return res.status(400).json({ msg: "ID de préstamo no válido." });
  }

  try {
    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ msg: "Préstamo no encontrado." });

    const fechaDevolucion = new Date();
    loan.fechaDevolucion = fechaDevolucion;

    // Se comprueba si hubo atraso para aplicar la sanción
    if (fechaDevolucion > new Date(loan.fechaVencimiento)) {
      const user = await User.findById(loan.usuarioId);
      if (user) {
        const diasAtraso = Math.ceil(
          (fechaDevolucion - new Date(loan.fechaVencimiento)) /
            (1000 * 60 * 60 * 24)
        );
        const sancionHasta = new Date();
        sancionHasta.setDate(sancionHasta.getDate() + diasAtraso);
        user.sancionHasta = sancionHasta;
        await user.save();
      }
    }

    // --- INICIO DE LA CORRECCIÓN ---
    // Independientemente de si hubo atraso o no, el estado final del préstamo ahora es 'devuelto'.
    loan.estado = "devuelto";
    // --- FIN DE LA CORRECCIÓN ---

    await loan.save();

    const ItemModel =
      loan.itemModel === "Exemplar" ? Exemplar : ResourceInstance;
    await ItemModel.findByIdAndUpdate(loan.item, {
      estado: newStatus,
      observaciones: observaciones,
    });

    res.json({ msg: "Préstamo devuelto exitosamente.", loan });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// --- INICIO DE LA MODIFICACIÓN ---
exports.getAllLoans = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalLoans = await Loan.countDocuments();
    const totalPages = Math.ceil(totalLoans / limit);

    const loans = await Loan.find()
      .populate("usuarioId", "primerNombre primerApellido")
      .sort({ fechaInicio: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // .lean() es importante para que podamos modificar el objeto

    // Usamos la nueva función auxiliar para formatear y verificar el estado
    const formattedLoans = await formatAndCheckLoans(loans);

    res.json({
      docs: formattedLoans,
      totalDocs: totalLoans,
      totalPages,
      page,
    });
  } catch (err) {
    console.error("Error en getAllLoans:", err.message);
    res.status(500).send("Error del servidor");
  }
};
// --- FIN DE LA MODIFICACIÓN ---

exports.getLoansByUser = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({ msg: "ID de usuario no válido." });
  }
  try {
    if (req.user.rol !== "admin" && req.user.id !== req.params.userId) {
      return res.status(403).json({ msg: "Acceso no autorizado." });
    }
    const loans = await Loan.find({ usuarioId: req.params.userId });
    res.json(loans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

exports.renewLoan = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ msg: "ID de préstamo no válido." });
  }

  const { days } = req.body;
  if (!days || isNaN(parseInt(days)) || parseInt(days) <= 0) {
    return res
      .status(400)
      .json({
        msg: "Por favor, proporciona un número válido de días para la renovación.",
      });
  }

  try {
    let loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ msg: "Préstamo no encontrado." });
    }
    if (loan.estado !== "enCurso") {
      return res
        .status(400)
        .json({ msg: 'Solo se pueden renovar préstamos "en curso".' });
    }
    const newDueDate = addBusinessDays(loan.fechaVencimiento, parseInt(days));
    loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { $set: { fechaVencimiento: newDueDate } },
      { new: true }
    );
    res.json({ msg: `Préstamo renovado por ${days} días hábiles.`, loan });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

// --- FUNCIÓN MODIFICADA ---
exports.getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({
      usuarioId: req.user.id,
    })
      .sort({ fechaInicio: -1 })
      .lean(); // .lean() es importante para que podamos modificar el objeto

    // Usamos la nueva función auxiliar aquí también
    const populatedLoans = await formatAndCheckLoans(loans);

    res.json(populatedLoans);
  } catch (err) {
    console.error("Error en getMyLoans:", err.message);
    res.status(500).send("Error del servidor");
  }
};

// @route   GET api/loans/overdue
// @desc    Obtener todos los préstamos actualmente atrasados
// @access  Private (Admin)
exports.getOverdueLoans = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const overdueQuery = {
            estado: 'enCurso',
            fechaVencimiento: { $lt: new Date() }
        };

        const totalDocs = await Loan.countDocuments(overdueQuery);
        const totalPages = Math.ceil(totalDocs / limit);

        const loans = await Loan.find(overdueQuery)
            .populate('usuarioId', 'primerNombre primerApellido rut')
            .sort({ fechaVencimiento: 1 }) // Ordenar por los más antiguos primero
            .skip(skip)
            .limit(limit)
            .lean();

        // Esta es la función auxiliar que ya creamos en la corrección anterior
        const formattedLoans = await formatAndCheckLoans(loans);

        res.json({
            docs: formattedLoans,
            totalDocs,
            totalPages,
            page
        });

    } catch (err) {
        console.error("Error en getOverdueLoans:", err.message);
        res.status(500).send('Error del servidor');
    }
};