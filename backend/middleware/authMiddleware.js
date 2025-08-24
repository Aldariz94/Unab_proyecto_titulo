
/*
 * ----------------------------------------------------------------
 * backend/middleware/authMiddleware.js (VERSIÓN FINAL)
 * Vuelve a usar process.env y se elimina el código de depuración.
 * ----------------------------------------------------------------
 */
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No hay token, autorización denegada.' });
    }

    try {
        // Se usa la variable de entorno para verificar el token.
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Usando la variable de entorno
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'El token no es válido o ha expirado.' });
    }
};