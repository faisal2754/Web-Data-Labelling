const LabellingFragment = class LabellingFragment {
    constructor(labellerEmail, imgArray) {
        this.labellerEmail = labellerEmail
        this.imgArray = imgArray
        this.labelMapping = []
        imgArray.forEach((img) => {
            this.labelMapping.push({ imgUrl: img, label: null })
        })
    }

    getFragment() {
        const data = {
            email: this.labellerEmail,
            labelMapping: this.labelMapping
        }

        return data
    }
}

module.exports = LabellingFragment
