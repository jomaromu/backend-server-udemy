const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mdAutenticacion = require("../middleware/autenticacion");

const app = express();

// esquema medicos
const Medico = require('../models/medico');

// =====================================================
// Obtener todos los medicos
// =====================================================
app.get("/", (req, res) => {

    // desde
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al cargar los medicos",
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    medicos,
                    total: conteo
                });
            });
        });
});

// =====================================================
// Crear un medico nuevo
// =====================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    // recoger los datos del body
    const body = req.body;

    // id del usuario creador
    const idUsuario = req.usuario._id;

    // id del hospital
    const idMedico = body.hospital;

    // crear medico
    const medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: idUsuario,
        hospital: idMedico
    });

    // guardar el medico creado
    medico.save((err, medicoDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: "Error al crear medico",
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medicoDB,
        });
    });
});

// =====================================================
// Actualizar un medico
// =====================================================
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {

    const id = req.params.id;
    const body = req.body;

    // buscar el medico por id
    Medico.findById(id, (err, medico) => {
        // error interno
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar medico",
                errors: err
            });
        }

        // error si medico es nulo o vacío
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `El medico con el id ${id}, no existe`
            });
        }

        // actualizar medico
        medico.nombre = body.nombre;

        // grabar los datos
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar medico",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// =====================================================
// Eliminar un medico
// =====================================================
app.delete('/:id', (req, res) => {

    const id = req.params['id'];
    Medico.findByIdAndRemove(id, (err, medicolBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al borrar medico",
                errors: err
            });
        }

        if (!medicolBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El medico con el id ${id}, no existe`
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicolBorrado
        });
    });
});

module.exports = app; // !importante¡