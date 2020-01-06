const express = require("express");
const app = express();

const Hospital = require("../models/hospital");
const Medico = require("../models/medico");
const Usuario = require("../models/usuario");

// =====================================================
// Busqueda por coleccion
// =====================================================
app.get("/coleccion/:tabla/:busqueda", (req, res) => {
    const tipoTabla = req.params.tabla;

    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, "i");

    switch (tipoTabla) {
        case "medicos":
            buscarMedicos(busqueda, regex).then(medico => {
                res.status(200).json({
                    ok: true,
                    medico: medico
                });
            });
            break;
        case "hospitales":
            buscarHospitales(busqueda, regex).then(hospital => {
                res.status(200).json({
                    ok: true,
                    hospital: hospital
                });
            });
            break;
        case "usuarios":
            buscarUsuarios(busqueda, regex).then(usuario => {
                res.status(200).json({
                    ok: true,
                    usuario: usuario
                });
            });
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: "No se encuentra esa ruta"
            });
    }
});

// =====================================================
// Busqueda general
// =====================================================
app.get("/todo/:busqueda", (req, res, next) => {
    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, "i");

    // gestionar todas las promesas
    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0], // las respuestas estan en un arreglo en orden de respuesta
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});

// funcion promesa que gestiona la busqueda de hospitales
function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate("usuario", "nombre email")
            .exec((err, hospitales) => {
                if (err) {
                    reject("Error al cargar hospitales");
                } else {
                    resolve(hospitales);
                }
            });
    });
}

// funcion promesa que gestiona la busqueda de medicos
function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate("usuario", "nombre email")
            .populate("hospital")
            .exec((err, medicos) => {
                if (err) {
                    reject("Error al cargar medicos");
                } else {
                    resolve(medicos);
                }
            });
    });
}

// funcion promesa que gestiona la busqueda de usuarios
function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, "nombre email role")
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject("Error al cargar usuarios", err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app; // !imporante