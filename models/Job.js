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
    images: {
        type: Array,
        require: true
    },
    emailOwner: {
        type: String,
        require: true
    },
    emailLabellers: {
        type: Array,
        require: false
    }
    },
    {
    timestamps: true
})


module.exports = mongoose.model('Job', jobSchema)
