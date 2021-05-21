const mongoose = require('mongoose')
const User = require('../../models/User')
const Job = require('../../models/Job')
const app = require('../testServer')
const superagent = require('superagent')
const { deleteMany } = require('../../models/User')
const fs = require('fs')

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
            expect(res.redirects[0] === 'http://localhost:3000/').toBeTruthy()
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
                expect(res.redirects[0] === 'http://localhost:3000/login').toBeTruthy()
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
                expect(res.redirects[0] === 'http://localhost:3000/login').toBeTruthy()
                done()
            })
    })
})

describe('Invalid users should not be added to the database', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    it('Should not store user', (done) => {
        superagent
            .post('http://localhost:3000/register')
            .send({})
            .end((err, res) => {
                expect(res.status == 400).toBeTruthy()
                done()
            })
    })
})

describe('Logged in user should be able to create jobs', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })
    let agent = superagent.agent({ timeout: 3000 })
    it('register', registerUser(agent))
    it('login', loginUser(agent))

    it('should create a job', async (done) => {
        var fileContent = 'Hello World!'
        var path = 'public/uploads/test_file.txt'

        fs.writeFileSync(path, fileContent)

        agent
            .post('http://localhost:3000/create-job')
            .send({
                title: 'test title',
                description: 'test description',
                credits: 100,
                labels: ['one', 'two'],
                emailOwner: 'Test@Test.com'
            })
            .end((err, res) => {
                expect(res.status == 200).toBeTruthy()
                done()
            })
    })
})

describe('Invalid jobs should not be created', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })
    let agent = superagent.agent({ timeout: 10000 })
    it('register', registerUser(agent))
    it('login', loginUser(agent))

    it('should not create a job', async (done) => {
        agent
            .post('http://localhost:3000/create-job')
            .send({})
            .end((err, res) => {
                expect(res.status == 400).toBeTruthy()
                expect(res.text == 'Bad Request. Redirecting to /').toBeTruthy()
                done()
            })
    })
})

describe('Logged in user should be able to accept jobs', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })
    let agent = superagent.agent({ timeout: 10000 })
    it('register', registerUser(agent))
    it('login', loginUser(agent))

    it('should create a job', async (done) => {
        const job = new Job({
            title: 'test title',
            description: 'test description',
            credits: 100,
            labels: ['one', 'two'],
            images: [],
            emailOwner: 'Test@Test.com',
            emailLabellers: ['test@test.com']
        })

        job.save().then((savedJob) => {
            expect(savedJob == job).toBeTruthy()
            done()
        })
    })

    it('should accept a job', async (done) => {
        const job = await Job.findOne({ emailOwner: 'Test@Test.com' })
        const id = job._id

        agent
            .post('http://localhost:3000/acceptJob')
            .send({
                jobId: id
            })
            .end((err, res) => {
                //console.log(res)
                expect(res.status == 200).toBeTruthy()
                expect(res.redirects[0] == 'http://localhost:3000/dashboard').toBeTruthy()
                done()
            })
    })
})

describe('Only valid jobs should be able to be accepted.', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })
    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))

    it('should accept a job', async (done) => {
        agent
            .post('http://localhost:3000/acceptJob')
            .send({
                jobId: ''
            })
            .end((err, res) => {
                expect(res.status == 400).toBeTruthy()
                expect(res.text == 'Bad Request. Redirecting to /login').toBeTruthy()
                done()
            })
    })
})

describe('Unlogged in user should not be able to accept jobs.', () => {
    it('should accept a job', async (done) => {
        superagent
            .post('http://localhost:3000/acceptJob')
            .send({
                jobId: ''
            })
            .end((err, res) => {
                expect(res.status == 400).toBeTruthy()
                expect(res.text == 'Bad Request. Redirecting to /login').toBeTruthy()
                done()
            })
    })
})
