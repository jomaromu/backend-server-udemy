const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SEED = require("../config/config").SEED;

// esquema de usuario
const Usuario = require("../models/usuario");

// Google
const CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

// ===========================
// Autentición de google
// ===========================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post("/google", async(req, res) => {
    const token = req.body.token;

    const googleUser = await verify(token).catch(err => {
        return res.status(403).json({
            ok: false,
            mensaje: "Token no válido"
        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuarios",
                errors: err
            });
        }

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Debe de usar su autenticación normal"
                });
            } else {
                const token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expiresIn: 14400
                });

                res.status(201).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            // el usuario no existe, hay que crearlo
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ":)";

            usuario.save((err, usuarioDB) => {
                const token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expiresIn: 14400
                });

                res.status(201).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            });
        }
    });

    // res.status(200).json({
    //     ok: true,
    //     mensaje: "OK!!",
    //     userGoogle: userGoogle,
    //     token: token
    // });
});

// ===========================
// Autentición de normal
// ===========================
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
                mensaje: "Credenciales incorrectas - email"
            });
        }

        // buscar password (regresa true o false)
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - password"
            });
        }

        // crear un token
        usuarioDB.password = ":)";
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