const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
    const { primerNombre, primerApellido, rut, correo, password, rol, curso } = req.body;
    try {
        let user = await User.findOne({ $or: [{ correo }, { rut }] });
        if (user) {
            return res.status(400).json({ msg: 'El correo o RUT ya está registrado.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({
            primerNombre,
            primerApellido,
            rut,
            correo,
            hashedPassword,
            rol,
            curso: rol === 'alumno' ? curso : undefined
        });
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.hashedPassword;
        res.status(201).json({ msg: 'Usuario creado exitosamente.', user: userResponse });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        // Construimos el objeto de la consulta de búsqueda
        let query = {};
        if (search) {
            const searchRegex = new RegExp(search, 'i'); // 'i' para no distinguir mayúsculas/minúsculas
            query = {
                $or: [
                    { primerNombre: searchRegex },
                    { primerApellido: searchRegex },
                    { rut: searchRegex },
                    { correo: searchRegex }
                ]
            };
        }

        // Contamos el total de documentos que coinciden con la búsqueda
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);

        // Obtenemos los usuarios para la página actual, aplicando el filtro de búsqueda
        const users = await User.find(query)
            .select('-hashedPassword')
            .sort({ createdAt: -1, _id: 1 })
            .skip(skip)
            .limit(limit);

        res.json({
            docs: users,
            totalDocs: totalUsers,
            totalPages,
            page
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};


exports.updateUser = async (req, res) => {
    const { primerNombre, primerApellido, rut, correo, password, rol, curso } = req.body;
    
    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        // Construir objeto con los campos a actualizar
        const userFields = { primerNombre, primerApellido, rut, correo, rol, curso };

        // Si se proporciona una nueva contraseña, hashearla
        if (password) {
            const salt = await bcrypt.genSalt(10);
            userFields.hashedPassword = await bcrypt.hash(password, salt);
        }

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: userFields },
            { new: true } // Devuelve el documento modificado
        ).select('-hashedPassword');

        res.json({ msg: 'Usuario actualizado exitosamente.', user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};

// @route   DELETE api/users/:id
// @desc    Eliminar un usuario (NUEVA IMPLEMENTACIÓN)
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        if (user.rol === 'admin') {
            return res.status(403).json({ msg: 'No se puede eliminar a otro administrador.' });
        }

        const activeLoans = await Loan.findOne({ 
            usuarioId: user._id, 
            estado: { $in: ['enCurso', 'atrasado'] } 
        });

        if (activeLoans) {
            return res.status(400).json({ msg: 'No se puede eliminar a este usuario porque tiene préstamos activos o atrasados.' });
        }
        
        // --- INICIO DE LA NUEVA LÓGICA ---
        // 3. Buscar y procesar las reservas activas del usuario
        const activeReservations = await Reservation.find({ 
            usuarioId: user._id,
            estado: 'pendiente'
        });

        if (activeReservations.length > 0) {
            // Liberamos cada ítem que estaba reservado
            for (const reservation of activeReservations) {
                const Model = reservation.itemModel === 'Exemplar' ? Exemplar : ResourceInstance;
                await Model.findByIdAndUpdate(reservation.item, { estado: 'disponible' });
            }
            // Eliminamos todas las reservas pendientes del usuario
            await Reservation.deleteMany({ usuarioId: user._id, estado: 'pendiente' });
        }
        // --- FIN DE LA NUEVA LÓGICA ---

        await User.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Usuario y sus reservas activas han sido eliminados exitosamente.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};



exports.getSanctionedUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { sancionHasta: { $gt: new Date() } };

        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);

        const sanctionedUsers = await User.find(query)
            .select('-hashedPassword')
            .sort({ sancionHasta: 1 }) // Ordenar por fecha de sanción más próxima
            .skip(skip)
            .limit(limit);

        res.json({
            docs: sanctionedUsers,
            totalDocs: totalUsers,
            totalPages,
            page
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};
// --- FIN DE LA MODIFICACIÓN ---

// @route   PUT api/users/:id/remove-sanction
// @desc    Perdonar/eliminar la sanción de un usuario
// @access  Private (Admin)
exports.removeSanction = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { sancionHasta: null } }, // Establece la fecha de sanción a null
            { new: true }
        ).select('-hashedPassword');

        res.json({ msg: 'Sanción eliminada exitosamente.', user });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};



// @route   GET api/users/me
// @desc    Obtener los datos del usuario con la sesión activa
// @access  Private
exports.getMe = async (req, res) => {
    try {
        // req.user.id es añadido por el middleware de autenticación
        const user = await User.findById(req.user.id).select('-hashedPassword');
        if (!user) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
};