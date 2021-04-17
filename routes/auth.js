const router = require("express").Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const email = req.body.register_email;
  const password = req.body.register_password;
  const user = new User({
    email: email,
    password: password,
  });

  try {
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (error) {
    res.send(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.login_email;
    const password = req.body.login_password;
    const user = await User.findOne({ email: req.body.login_email });

    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
