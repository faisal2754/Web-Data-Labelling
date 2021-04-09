const router = require('express').Router()
const User = require('../model/User')
// const Joi = require('joi')

// const schema = Joi.object({
//     email: Joi.string().email().required(),
//     password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
//     repeat_password: Joi.ref('password'),
// })

router.post('/register', async (req, res) => {
  // const { error, value } = schema.validate(req.body)
  // res.send(error)
  const user = new User({
    email: req.body.email,
    password: req.body.password,
  })
  try {
    const savedUser = await user.save()
    res.send(savedUser)
  } catch (error) {
    res.status(400).send(error)
  }
})

// router.post('/login');

module.exports = router
