const express = require('express');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config')
const ExpressError = require('../expressError')
const { ensureCorrectUser } = require('../middleware/auth')
const { authenticateJWT } = require('../middleware/auth')
const { ensureLoggedIn } = require('../middleware/auth')

const User = require('../models/user')
const Message = require('../models/message')


const router = new express.Router()

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async function (req, res, next) {
  try {
    const message = await Message.get(req.params.id);

    if (req.user === message.to_user.username || req.user === message.from_user.username) {
      return res.json({ message });
    }

    throw new ExpressError("Not authorized to view this message");
  }
  catch (err) {
    return next(err);
  }
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedin, async function (req, res, next) {
  try {
    const message = await Message.create(req.body);

    if (message) {
      return res.json({ message });
    }
  }
  catch (err) {
    return next(err);
  }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async function (req, res, next) {
  try {
    const message = await Message.get(req.params.id);

    if (req.user === message.to_user.username) {
      const messageRead = await Message.markRead(req.params.id);
      return res.json({ messageRead });
    }
  }
  catch (err) {
    return next(err);
  }
});

module.exports = router