const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mdAutenticacion = require("../middleware/autenticacion");

const app = express();

// esquema de hospitales
const Hospital = require("../models/hospital");

// =====================================================
// Obtener todos los hospitales
// =====================================================
app.get("/", (req, res) => {

    // desde
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .populate('usuario', 'nombre email') // obtener los datos del elemento referenciado
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al cargar los hospitales",
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    hospitales,
                    total: conteo
                });
            });

        });
});

// =====================================================
// Actualizar un hospital
// =====================================================
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {

    const id = req.params.id;
    const body = req.body;

    // buscar el hospital por id
    Hospital.findById(id, (err, hospital) => {
        // error interno
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar hospital",
                errors: err
            });
        }

        // error si usuario es nulo o vacío
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id}, no existe`
            });
        }

        // actualizar hospital
        hospital.nombre = body.nombre;

        // grabar los datos
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar hospital",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// =====================================================
// Crear un hospital nuevo
// =====================================================
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    // recoger los datos del body
    const body = req.body;

    // id del usuario creador
    const idUsuario = req.usuario._id;

    // crear hospital
    const hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: idUsuario
    });

    // guardar el hospital creado
    hospital.save((err, hospitalDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear hospital",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospitalDB,
            usuarioCreador: {
                idUsuario
            }
        });
    });
});

// =====================================================
// Eliminar un hospital
// =====================================================
app.delete('/:id', (req, res) => {

    const id = req.params['id'];
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar hospital",
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id}, no existe`
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app; // ¡importante!