const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Book = new Schema({
    name: {
        type: String,
        required: true
    }, 
    slug: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }, 
    hashtags: [{
        type: String,
        required: false
    }], 
    description: {
        type: String,
        required: false
    }, 
    cover: { 
        type: String,
        required: false
    }, 
    file_pdf: {
        type: String,
        required: false
    }, 
    file_epub: {
        type: String,
        required: false
    }, 
    file_mobi: { 
        type: String,
        required: false
    }, 
    user: { 
        type: String,
        required: true
    }, 
    date: {
        type: Date,
        default: Date.now()
    }
});

mongoose.model('books', Book);  