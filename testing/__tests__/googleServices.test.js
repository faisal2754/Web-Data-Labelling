const googleService = require('../../googleServices')

const service = new googleService()

test("creating a folder should return that folder's id", () => {
    return service.createFolder().then((data) => {
        expect(data).toBeTruthy()
    })
})
