const express = require('express');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config')
const ExpressError = require('../expressError')


const User = require('../models/user')
const Message = require('../models/message')


const router = new express.Router()

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await User.authenticate(username, password);
    if (result) {
      let token = jwt.sign({ username }, SECRET_KEY);
      return res.json({ token })
    }
    throw new ExpressError("Invalid user/password", 400);
  }
  catch (err) {
    return next(err);
  }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async function (req, res, next) {
  try {
    const { username, password, first_name, last_name, phone } = req.body;
    const result = await User.register({ username, password, first_name, last_name, phone })

    if (result) {
      let token = jwt.sign({ username }, SECRET_KEY);
      return res.json({ token })
    }
    throw new ExpressError("Invalid user/password", 400);
  }
  catch (err) {
    return next(err)
  }
})

module.exports = router