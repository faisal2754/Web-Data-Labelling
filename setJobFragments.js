const { set } = require('mongoose')
const Labelling = require('./models/Labelling')

module.exports = async function setJobFragments(jobId, numLabellers, imgUrlArr) {
    const fragmentArr = []
    const imgUrls = imgUrlArr
    const equalAmount = Math.floor(imgUrls.length / numLabellers)
    var currentUrl = 0
    for (let i = 0; i < numLabellers; i++) {
        let imgFragment
        if (i == numLabellers - 1) {
            imgFragment = imgUrls.slice(currentUrl)
        } else {
            imgFragment = imgUrls.slice(currentUrl, currentUrl + equalAmount)
            currentUrl += equalAmount
        }

        const fragment = new LabellingFragment(null, imgFragment)
        fragmentArr.push(fragment.getFragment())
    }
    const labelling = new Labelling({
        jobId: jobId,
        labellersArr: fragmentArr
    })

    await labelling.save()
}
