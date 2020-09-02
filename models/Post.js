const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Post = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    hashtags: [{
        type: String,
        required: false
    }],
    thumbnail: { 
        type: String, 
        required: false
    },
    description: {
        type: String, 
        required: true
    },
    content: {
        type: String,
        required: true
    },
    user: { 
        type: String,
        required: true
    }, 
    likes: [{
        type: String,
        required: false
    }], 
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

mongoose.model('posts', Post);