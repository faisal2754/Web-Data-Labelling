const mongoose = require("mongoose");
const User = require("../../models/User");
const app = require("../testServer");
const request = require("supertest");
//const server = request.agent("http://localhost:3000");
const { deleteMany } = require("../../models/User");

async function removeAllCollections() {
    const collections = Object.keys(mongoose.connection.collections);

    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName];
        await collection.deleteMany();
    }
}

// Hook cleans up database between each test.
// afterEach(async () => {
//     await removeAllCollections();
// });

afterAll(async () => {
    await removeAllCollections();
});

function registerUser() {
    return function (done) {
        request(app)
            .post("/register")
            .send({
                name: "TestName",
                email: "Test@Test.com",
                password: "Testing1",
            })
            .then(async function (res) {
                const user = await User.findOne({ email: "Test@Test.com" });

                expect(
                    user.name == "TestName" &&
                        user.email == "Test@Test.com" &&
                        user.password == "Testing1"
                ).toBeTruthy();
                done();
            })
            .catch((err) => done(err));
    };
}

//it("Should insert a new user into the database", registerUser());

describe("Should allow a registered user to log in", () => {
    //it("register", registerUser());

    it("login", async (done) => {
        const user = new User({
            name: "TestName",
            email: "Test@Test.com",
            password: "Testing1",
        });
        await user.save();

        request(app)
            .post("/login")
            .send({ email: "Test@Test.com", password: "Testing1" })
            .end(function (err, res) {
                if (err) return done(err);
                expect(res.header.location == "dashboard").toBeTruthy();
                done();
            });
    });
});

// it("Should insert a new user into the database", async (done) => {
//     request(app)
//         .post("/register")
//         .send({
//             name: "TestName",
//             email: "Test@Test.com",
//             password: "Testing1",
//         })
//         .then(async function (res) {
//             const user = await User.findOne({ email: "Test@Test.com" });

//             expect(
//                 user.name == "TestName" &&
//                     user.email == "Test@Test.com" &&
//                     user.password == "Testing1"
//             ).toBeTruthy();
//             done();
//         })
//         .catch((err) => done(err));
// });

// it("should allow a registered user to login", async (done) => {
//     const user = new User({
//         name: "TestName",
//         email: "Test@Test.com",
//         password: "Testing1",
//     });
//     await user.save();

//     request(app)
//         .post("/login")
//         .send({
//             email: "Test@Test.com",
//         })
//         .then((res) => {
//             console.log(res.body);
//             expect(
//                 res.body.email == "Test@Test.com" &&
//                     res.body.password == "Testing1"
//             ).toBeTruthy();
//             done();
//         })
//         .catch((err) => done(err));
// });

//it("Should allow a register user to login", async (done) => {});
