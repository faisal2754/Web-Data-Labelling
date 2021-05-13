const mongoose = require('mongoose')
const User = require('../../models/User')
const app = require('../testServer')
const superagent = require('superagent')
const { deleteMany } = require('../../models/User')

let appServer

beforeAll((done) => {
    appServer = app.listen(3000)
    done()
})

afterAll((done) => {
    appServer.close()
    done()
})

async function removeAllCollections() {
    const collections = Object.keys(mongoose.connection.collections)

    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName]
        await collection.deleteMany()
    }
}

function registerUser(agent) {
    return async function (done) {
        agent
            .post('http://localhost:3000/register')
            .send({
                name: 'TestName',
                email: 'Test@Test.com',
                password: 'Testing1',
            })
            .end(await onResponse)

        async function onResponse(err, res) {
            const user = await User.findOne({ email: 'Test@Test.com' })

            expect(
                user.name == 'TestName' &&
                    user.email == 'Test@Test.com' &&
                    user.password == 'Testing1'
            ).toBeTruthy()
            return done()
        }
    }
}

function loginUser(agent) {
    return function (done) {
        agent
            .post('http://localhost:3000/login')
            .send({ email: 'Test@Test.com', password: 'Testing1' })
            .end(onResponse)

        function onResponse(err, res) {
            expect(res.status == 200).toBeTruthy()
            expect(
                res.redirects[0] === 'http://localhost:3000/dashboard'
            ).toBeTruthy()
            done()
            return done()
        }
    }
}

describe('Should allow user to register', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('register', registerUser(agent))
})

describe('Should allow a registered user to login', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
})

describe('Should allow a logged in user to access protected routes', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('access protected', (done) => {
        agent.get('http://localhost:3000/user-profile').end((err, res) => {
            expect(res.status == 200).toBeTruthy()
            expect(res.req.path === '/user-profile').toBeTruthy()
            done()
        })
    })
})

describe('Should allow a logged in user to log out', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('logout', (done) => {
        agent.delete('http://localhost:3000/logout').end((err, res) => {
            expect(res.status == 200).toBeTruthy()
            expect(res.text === '/').toBeTruthy()
            done()
        })
    })
})

describe('Should not allow an unregistered user to log in', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('login failed', (done) => {
        agent
            .post('http://localhost:3000/login')
            .send({ email: 'INVALID', password: 'INVALID' })
            .end((err, res) => {
                expect(res.status == 200).toBeTruthy()
                expect(
                    res.redirects[0] === 'http://localhost:3000/login'
                ).toBeTruthy()
                done()
            })
    })
})

describe('Should not allow a registered user to log in with an incorrect password', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login failed', (done) => {
        agent
            .post('http://localhost:3000/login')
            .send({ email: 'Test@Test.com', password: 'INVALID' })
            .end((err, res) => {
                expect(res.status == 200).toBeTruthy()
                expect(
                    res.redirects[0] === 'http://localhost:3000/login'
                ).toBeTruthy()
                done()
            })
    })
})
