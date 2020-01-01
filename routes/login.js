const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

// esquema de usuario
const Usuario = require("../models/usuario");

app.post("/", (req, res) => {
    const body = req.body;

    // buscar usuario
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        // error interno
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuarios",
                errors: err
            });
        }

        // error al no encontrar email
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - email",
            });
        }

        // buscar password (regresa true o false)
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - password",
            });
        }

        // crear un token
        usuarioDB.password = ':)';
        const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(201).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });
});

module.exports = app;