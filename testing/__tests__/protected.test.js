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

function accessRoute(agent, route) {
    return function (done) {
        agent.get(route).end((err, res) => {
            expect(res.status == 200).toBeTruthy()
            expect(res.redirects.length == 0).toBeTruthy()
            done()
        })
    }
}

describe('Logged in user should be able to access create job page', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })
    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should access home page', accessRoute(agent, 'http://localhost:3000/create-job'))
})

describe('Logged in user should be able to access dashboard page', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })
    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should access dashboard page', accessRoute(agent, 'http://localhost:3000/dashboard'))
})

describe('Logged in user should be able to access accepted job page', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })
    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should access accepted job page', accessRoute(agent, 'http://localhost:3000/accepted-jobs'))
})

describe('Logged in user should be able to access the magic secret page', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })
    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should access magic secret page', accessRoute(agent, 'http://localhost:3000/secret-page'))
})

describe('Logged in user should be able to access user profile page', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })
    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should access user profile page', accessRoute(agent, 'http://localhost:3000/user-profile'))
})

describe('Logged in user should be able to delete their jobs', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })
    let agent = superagent.agent()
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

    it('should delete the create job', async (done) => {
        const job = await Job.findOne({ emailOwner: 'Test@Test.com' })
        const id = job._id

        agent
            .post('http://localhost:3000/dashboard')
            .send({
                id: id
            })
            .end((err, res) => {
                expect(res.status == 200).toBeTruthy()
                expect(res.redirects[0] == 'http://localhost:3000/dashboard').toBeTruthy()
                done()
            })
    })
})

describe('Should raise exception if job deletion fails', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should raise alert about failure', async (done) => {
        agent
            .post('http://localhost:3000/dashboard')
            .send({
                id: ''
            })
            .end((err, res) => {
                expect(res.status == 400).toBeTruthy()
                expect(res.text == 'Bad Request. Redirecting to /').toBeTruthy()
                done()
            })
    })
})

describe('Logged in user should be able to update their profile information.', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })
    let agent = superagent.agent({ timeout: 3000 })
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should access user profile page', (done) => {
        var fileContent = 'Hello World!'
        var path = 'public/uploads/test_file.txt'

        fs.writeFileSync(path, fileContent)

        agent.post('http://localhost:3000/user-profile').end((err, res) => {
            expect(res.status == 200).toBeTruthy()
            expect(res.redirects[0] == 'http://localhost:3000/dashboard').toBeTruthy()
            done()
        })
    })
})

describe('Unlogged in user should not be able to update their profile information.', () => {
    it('should fail', (done) => {
        superagent.post('http://localhost:3000/user-profile').end((err, res) => {
            expect(res.status == 400).toBeTruthy()
            expect(res.text == 'Bad Request. Redirecting to /').toBeTruthy()
            done()
        })
    })
})

describe('Logged in user should be able to cancel a job.', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })
    let agent = superagent.agent()
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

    it('should cancel a job', async (done) => {
        const job = await Job.findOne({ emailOwner: 'Test@Test.com' })
        const id = job._id

        agent
            .post('http://localhost:3000/cancelJob')
            .send({
                jobId: id
            })
            .end((err, res) => {
                expect(res.status == 200).toBeTruthy()
                expect(res.redirects[0] == 'http://localhost:3000/dashboard').toBeTruthy()
                done()
            })
    })
})

describe('Unlogged in user should not be able to cancel a job.', () => {
    it('should fail', (done) => {
        superagent.post('http://localhost:3000/cancelJob').end((err, res) => {
            expect(res.status == 400).toBeTruthy()
            expect(res.text == 'Bad Request. Redirecting to /').toBeTruthy()
            done()
        })
    })
})
