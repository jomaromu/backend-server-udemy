const express = require('express');
const mongoose = require('mongoose');

// inicializar express
const app = express();

// conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true, useUnifiedTopology: true }, (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

app.listen(3000, () => {
    console.log('Escuchando en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});