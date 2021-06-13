const mongoose = require('mongoose')
const User = require('../../models/User')
const app = require('../testServer')
const superagent = require('superagent')
const { deleteMany } = require('../../models/User')
const { accessapproval_v1 } = require('googleapis')

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

describe('Unlogged in user should be able to access login page', () => {
    it('should access login page', accessRoute(superagent.agent(), 'http://localhost:3000/login'))
})

describe('Unlogged in user should be able to access register page', () => {
    it('should access register page', accessRoute(superagent.agent(), 'http://localhost:3000/register'))
})

describe('Unlogged in user should be able to access home page', () => {
    it('should access home page', accessRoute(superagent.agent(), 'http://localhost:3000/'))
})

describe('Logged in user should be able to access home page', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should access home page', accessRoute(agent, 'http://localhost:3000/'))
})

describe('Unlogged in user should be able to access available page', () => {
    it('should access available jobs page', accessRoute(superagent.agent(), 'http://localhost:3000/available-jobs'))
})

describe('Logged in user should be able to access available jobs page', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should access available jobs page', accessRoute(agent, 'http://localhost:3000/available-jobs'))
})

describe('Unlogged in user should be able to how-to page', () => {
    it('should access how-to page', accessRoute(superagent.agent(), 'http://localhost:3000/how-to-page'))
})

describe('Logged in user should be able to access how-to page', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should access how-to page', accessRoute(agent, 'http://localhost:3000/how-to-page'))
})

describe('Unlogged in user should be able to about-us page', () => {
    it('should access about-us page', accessRoute(superagent.agent(), 'http://localhost:3000/about-us'))
})

describe('Logged in user should be able to access about-us page', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should access about-us page', accessRoute(agent, 'http://localhost:3000/about-us'))
})

describe('Unlogged in user should be able to contact-us page', () => {
    it('should access contact-us page', accessRoute(superagent.agent(), 'http://localhost:3000/contact-us'))
})

describe('Logged in user should be able to access contact-us page', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should access contact-us page', accessRoute(agent, 'http://localhost:3000/contact-us'))
})

describe('Unlogged in user should be able to terms and conditions page', () => {
    it(
        'should access terms and conditions page',
        accessRoute(superagent.agent(), 'http://localhost:3000/terms-conditions')
    )
})

describe('Logged in user should be able to access terms and conditions  page', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should access terms and conditions page', accessRoute(agent, 'http://localhost:3000/terms-conditions'))
})

/*describe('Loading screen should be accessible', () => {
    it('should access loading screen', (done) => {
        superagent.get('http://localhost:3000/loading-screen').end((err, res) => {
            expect(res.status == 200).toBeTruthy()
            done()
        })
    })
})*/

describe('Logged in user should be able to access how it works page', () => {
    afterAll(async (done) => {
        await removeAllCollections()
        done()
    })

    let agent = superagent.agent()
    it('register', registerUser(agent))
    it('login', loginUser(agent))
    it('should access how it works page', accessRoute(agent, 'http://localhost:3000/how-it-works'))
})

describe('Unlogged in user should be able to access how it works page', () => {
    it('should access how it works page', (done) => {
        superagent.get('http://localhost:3000/how-it-works').end((err, res) => {
            expect(res.status == 200).toBeTruthy()
            done()
        })
    })
})
