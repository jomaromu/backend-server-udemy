const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// crear esquema
const Schema = mongoose.Schema;

// roles válidos
const rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
}

const usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necearia'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, default: false }
});


// usar plugines para mongoose
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

// exporto el modelo
module.exports = mongoose.model('Usuario', usuarioSchema);