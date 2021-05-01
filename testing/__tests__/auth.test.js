const mongoose = require('mongoose')
const User = require('../../models/User')
const app = require('../testServer')
const request = require('supertest')
const { deleteMany } = require('../../models/User')

async function removeAllCollections() {
    const collections = Object.keys(mongoose.connection.collections)

    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName]
        await collection.deleteMany()
    }
}

function registerUser() {
    return function (done) {
        request(app)
            .post('/register')
            .send({
                name: 'TestName',
                email: 'Test@Test.com',
                password: 'Testing1',
            })
            .then(async function (res) {
                const user = await User.findOne({ email: 'Test@Test.com' })

                expect(
                    user.name == 'TestName' &&
                        user.email == 'Test@Test.com' &&
                        user.password == 'Testing1'
                ).toBeTruthy()
                done()
            })
            .catch((err) => done(err))
    }
}

function loginUser() {
    return function (done) {
        request(app)
            .post('/login')
            .send({ email: 'Test@Test.com', password: 'Testing1' })
            .end(function (err, res) {
                if (err) return done(err)
                expect(res.header.location === 'dashboard').toBeTruthy()
                done()
            })
    }
}

// describe('passport', () => {
//     it('register', registerUser())
//     it('login', loginUser())
//     it('access', async (done) => {
//         request(app)
//             .get('/create-job')
//             .end(function (err, res) {
//                 if (err) return done(err)
//                 //console.log(res)
//                 //expect(res.header.location === 'create').toBeTruthy()
//                 done()
//             })
//     })
// })

describe('Should insert a new user into the database', () => {
    afterEach(async () => {
        await removeAllCollections()
    })

    it('register', registerUser())

    it('should fail with error', async (done) => {
        request(app)
            .post('/register')
            .send({
                name: '',
                email: '',
                password: '',
            })
            .end(function (err, res) {
                if (err) return done(err)
                expect(res.header.location === '/register').toBeTruthy()
                done()
            })
    })
})

describe('Should allow a registered user to log in', () => {
    afterAll(async () => {
        await removeAllCollections()
    })

    it('register', registerUser())
    it('login', loginUser())
})

describe('Should allow a logged in user to log out', () => {
    afterAll(async () => {
        await removeAllCollections()
    })

    it('register', registerUser())
    it('login', loginUser())
    it('logout', async (done) => {
        request(app)
            .delete('/logout')
            .end(function (err, res) {
                if (err) return done(err)
                expect(res.header.location === '/').toBeTruthy()
                done()
            })
    })
})
