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
    profile_picture: { 
        type: String,
        required: false
    }, 
    user_status: { 
        type: String,
        required: true,
        default: 1
    }, 
    profile_desc: {
        type: String,
        required: false
    },
    wallets: [{
        type: String,
        required: false
    }],
    verified: {
        type: String,
        required: true,
        default: 0
    },
    token: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

mongoose.model('users', User);