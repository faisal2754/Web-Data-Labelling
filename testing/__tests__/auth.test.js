const mongoose = require("mongoose");
const User = require("../../models/User");
const app = require("../testServer");
const request = require("supertest");
const { deleteMany } = require("../../models/User");

/*
async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);

  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany();
  }
}

// Hook cleans up database between each test.
afterEach(async () => {
  await removeAllCollections();
});*/

it("Should insert a new user into the database", async (done) => {
  request(app)
    .post("/register")
    .send({
      email: "Test@Test.com",
      password: "password",
    })
    .then(async function (res) {
      const user = await User.findOne({ email: "Test@Test.com" });
      expect(
        user.email == "Test@Test.com" && user.password == "password"
      ).toBeTruthy();
      done();
    })
    .catch((err) => done(err));
});

it("should allow a registered user to login", async (done) => {
  const user = new User({
    email: "Test@Test.com",
    password: "password",
  });
  await user.save();

  request(app)
    .post("/login")
    .send({
      email: "Test@Test.com",
    })
    .then((res) => {
      expect(
        res.body.email == "Test@Test.com" && res.body.password == "password"
      ).toBeTruthy();
      done();
    })
    .catch((err) => done(err));
});
