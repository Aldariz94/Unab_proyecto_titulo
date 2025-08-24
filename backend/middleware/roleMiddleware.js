const checkRole = (roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
        return res.status(403).json({ msg: 'Acceso prohibido. Rol insuficiente.' });
    }
    next();
};

module.exports = { checkRole };