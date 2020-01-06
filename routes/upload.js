const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");

const app = express();

const Usuario = require("../models/usuario");
const Medico = require("../models/medico");
const Hospital = require("../models/hospital");

app.use(fileUpload());

app.put("/:tipo/:id", (req, res, next) => {
    const tipo = req.params.tipo;
    const id = req.params.id;

    // tipos de colecciones
    const tiposValidos = ["hospitales", "medicos", "usuarios"];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Tipo de colección no válida",
            errors: {
                message: "Colección no válida"
            }
        });
    }

    // verificar si vienen archivos
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: "No hay archivos",
            errors: {
                message: "Ningún archivo"
            }
        });
    }

    // obtener nombre del archivo
    const archivo = req.files.imagen;
    const nombreCortado = archivo.name.split(".");
    const extImg = nombreCortado[nombreCortado.length - 1];

    // extenciones permitidas
    let extValidas = ["png", "jpg", "gif", "jpeg"];

    if (extValidas.indexOf(extImg) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Extensión no válida",
            errors: {
                message: "Las extenesiones válidas son: " + extValidas.join(", ")
            }
        });
    }

    // nombre de archivo personalizado
    const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extImg}`;

    // mover el archivo
    const path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al mover archivo",
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        // });
    });
});

// funcion que sube imagen por tipo de coleccion
function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === "usuarios") {

        Usuario.findById(id, (err, usuario) => {

            // verificar si existe ese id de usuario
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    errors: err,
                    message: 'No existe ese usuario'
                });
            }
            // path de donde está la imágen si existe
            const pathViejo = "./uploads/usuarios/" + usuario.img;

            // borrar imagen
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            errors: err,
                            message: 'No se pudo actualizar la imágen'
                        });
                    }
                });
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                // quitar el password
                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de usuario actualizada",
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === "medicos") {
        Medico.findById(id, (err, medico) => {

            // verificar si existe ese id de medico
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    errors: err,
                    message: 'No existe ese medico'
                });
            }

            // path de donde está la imágen si existe
            const pathViejo = "./uploads/medicos/" + medico.img;

            // borrar imagen
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            errors: err,
                            message: 'No se pudo actualizar la imágen'
                        });
                    }
                });
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de usuario actualizada",
                    usuario: medicoActualizado
                });
            });
        });
    }

    if (tipo === "hospitales") {
        Hospital.findById(id, (err, hospital) => {

            // verificar si existe ese id de hospital
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    errors: err,
                    message: 'No existe ese hospital'
                });
            }

            // path de donde está la imágen si existe
            const pathViejo = "./uploads/hospitales/" + hospital.img;

            // borrar imagen
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            errors: err,
                            message: 'No se pudo actualizar la imágen'
                        });
                    }
                });
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de usuario actualizada",
                    usuario: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app; // !imporante