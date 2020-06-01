const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const User = new Schema({
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    access: {
        type: String,
        required: true,
        default: 1
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

mongoose.model('users', User);