const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Group = new Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    thumbnail: { 
        type: String, 
        required: false
    },
    description: {
        type: String, 
        required: true
    },
    user: { 
        type: String,
        required: true
    }, 
    visibility_status: { 
        type: String,
        required: true,
        default: 0
    }, 
    date: {
        type: Date,
        default: Date.now()
    }
});

mongoose.model('groups', Group);