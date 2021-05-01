const User = require('../../models/User')
const app = require('../testServer')
const request = require('supertest')

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

it('Should not allow unregistered user to log in', (done) => {
    request(app)
        .post('/login')
        .send({
            email: 'Test@Test.com',
            password: 'Testing1',
        })
        .end(function (err, res) {
            if (err) return done(err)
            expect(res.header.location === 'login').toBeTruthy()
            done()
        })
})

describe('It should not allow a user to log in with incorrect password', () => {
    it('register', registerUser())
    it('login', async (done) => {
        request(app)
            .post('/login')
            .send({ email: 'Test@Test.com', password: 'T' })
            .end(function (err, res) {
                if (err) return done(err)
                expect(res.header.location === 'login').toBeTruthy()
                done()
            })
    })
})
