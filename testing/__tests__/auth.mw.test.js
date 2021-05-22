const mongoose = require('mongoose')
const User = require('../../models/User')
const Job = require('../../models/Job')
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
                password: 'Testing1'
            })
            .end(await onResponse)

        async function onResponse(err, res) {
            const user = await User.findOne({ email: 'Test@Test.com' })

            expect(user.name == 'TestName' && user.email == 'Test@Test.com' && user.password == 'Testing1').toBeTruthy()
            return done()
        }
    }
}

function loginUser(agent) {
    return function (done) {
        agent.post('http://localhost:3000/login').send({ email: 'Test@Test.com', password: 'Testing1' }).end(onResponse)

        function onResponse(err, res) {
            expect(res.status == 200).toBeTruthy()
            expect(res.redirects[0] === 'http://localhost:3000/dashboard').toBeTruthy()
            done()
            return done()
        }
    }
}

describe('Should not allow an unlogged in user to access protected resources ', () => {
    it('should fail', (done) => {
        superagent.get('http://localhost:3000/create-job').end((err, res) => {
            expect(res.status == 302)
            expect(res.redirects[0] == 'http://localhost:3000/')
            done()
        })
    })
})
