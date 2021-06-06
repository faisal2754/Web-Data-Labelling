const googleService = require('../../googleServices')
const fs = require('fs')
const { serviceusage } = require('googleapis/build/src/apis/serviceusage')
const { disconnect } = require('process')

describe('creating a folder should return that folders id', () => {
    jest.setTimeout(10000)
    const service = new googleService()

    it('should create a folder', async (done) => {
        const res = await service.createFolder()
        expect(res.data).not.toBeNull()
        done()
    })
})

describe('should upload and delete files', () => {
    jest.setTimeout(10000)
    afterAll(async (done) => {
        fs.rmSync('public/uploads/smile.jpg')
        done()
    })
    const service = new googleService()
    let url
    let id

    it('should upload a file', async (done) => {
        const src = 'testing/resources/smile.jpg'
        const dest = 'public/uploads/smile.jpg'

        fs.copyFileSync(src, dest)

        const res = await service.uploadFile('smile.jpg', 'public/uploads/')
        url = res.request.responseURL
        id = res.data.id
        expect(res.status == 200).toBeTruthy()
        done()
    })

    it('should delete uploaded file', async (done) => {
        const res = await service.deleteFiles([url])
        expect(res[0] == 200).toBeTruthy()
        done()
    })
})
