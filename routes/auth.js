const router = require("express").Router();
const User = require("../models/User");

router.get("/test", async (req, res) => {
  res.send("I am post");
});

router.post("/register", async (req, res) => {
  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });
  try {
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
