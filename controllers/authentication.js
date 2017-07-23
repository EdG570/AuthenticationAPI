const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  // User has already has their email and password auth'd
  // Just need to give them a tokenForUser
  res.send({ token: tokenForUser(req.user)});
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ error: 'Email and password are required' });
  }

  User.findOne({email: email})
    .then((user) => {
      // if (err) { return next(err); }
      if (user) { return res.status(422).send({ error: 'Email is already in use'}); }

      const newUser = new User({
        email: email,
        password: password
      });

      newUser.save().then((user) => {
        res.json({ token: tokenForUser(user) });
      });
    })
    .catch(err => res.status(500).send({ error: 'A server error occurred while processing your request' }));
}
