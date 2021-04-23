const mongoose = require('mongoose')
const Schema = mongoose.Schema

const jobSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    credits: {
        type: Number,
        require: true
    },
    labels: {
        type: Array,
        require: true
    },
    email: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model('Job', jobSchema)
