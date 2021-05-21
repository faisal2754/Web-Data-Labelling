const googleService = require('../../googleServices')

const service = new googleService()

test("creating a folder should return that folder's id", async () => {
    const data = await service.createFolder()
    expect(data).toBeTruthy()
})
