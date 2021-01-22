const mongoose = require('mongoose');

const addCategory = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    imageLink: {
        type: String,
        required: true
    },
    offer: {
        type: String
    }
});

const Category = mongoose.model("AddCategory", addCategory);

module.exports = Category;