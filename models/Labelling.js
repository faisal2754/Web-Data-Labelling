const mongoose = require('mongoose')
const Schema = mongoose.Schema

const labellingSchema = new Schema(
    {
        jobId: {
            type: String,
            require: true
        },
        labellersArr: {
            type: Array,
            require: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Labelling', labellingSchema)
