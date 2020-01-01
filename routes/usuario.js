const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mdAutenticacion = require('../middleware/autenticacion');
// const SEED = require("../config/config").SEED;

const app = express();

// esquema de usuario
const Usuario = require("../models/usuario");

// =====================================================
// Obtener todos los usuarios
// =====================================================
app.get("/", (req, res, next) => {
    Usuario.find({}, "id nombre email role").exec((err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error cargando usuarios",
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            usuarios
        });
    });
});

// =====================================================
// Actualizar usuario
// =====================================================
app.put("/:id", mdAutenticacion.verificaToken, (req, res, next) => {
    const id = req.params.id;
    const body = req.body;

    // buscar el usuario por id
    Usuario.findById(id, (err, usuario) => {
        // error interno
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar usuario",
                errors: err
            });
        }

        // error si usuario es nulo o vacío
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id ${id}, no existe`
            });
        }

        // actualizar usuario
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        // grabar los datos
        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar usuario",
                    errors: err
                });
            }

            // no regresar password
            usuarioGuardado.password = ":)";

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

// =====================================================
// Crear un usuario nuevo
// =====================================================
app.post("/", mdAutenticacion.verificaToken, (req, res, next) => {
    // recoger los datos del body
    const body = req.body;

    // crear mi usuario basado en el esquema
    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    // guardar el usuario
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear usuario",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });
});

// =====================================================
// Eliminar un usuario
// =====================================================
app.delete("/:id", mdAutenticacion.verificaToken, (req, res, next) => {
    const id = req.params["id"];

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar usuario",
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id ${id}, no existe`
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app; // !importante