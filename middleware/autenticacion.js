const jwt = require("jsonwebtoken");
const SEED = require("../config/config").SEED;

// =====================================================
// Verificar token
// =====================================================

exports.verificaToken = function(req, res, next) {
    const token = req.query.token;

    // comprobacion del token
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: "Token incorrecto",
                errors: err
            });
        }

        // meter en el request el usuario que hizo la peticion
        req.usuario = decoded.usuario;
        next();
    });
};