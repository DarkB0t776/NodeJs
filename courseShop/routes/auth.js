const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const { registerValidator } = require('../utils/validators');
const router = Router();

//Log In
router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Log In',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError'),
  });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });
    if (candidate) {
      const isSame = await bcrypt.compare(password, candidate.password);
      if (isSame) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) {
            throw new Error(err);
          } else {
            res.redirect('/');
          }
        });
      } else {
        req.flash('loginError', 'User does not exist');
        res.redirect('/auth/login#login');
      }
    } else {
      req.flash('loginError', 'User does not exist');
      res.redirect('/auth/login#login');
    }
  } catch (e) {
    throw new Error(e);
  }
});

//Register
router.post('/register', registerValidator, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const errors = validationResult(req);

    //Check for errors
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#register');
    }

    //If no errors
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      name,
      password: hashedPassword,
      cart: { items: [] },
    });
    await user.save();
    res.redirect('/auth/login#login');
  } catch (e) {
    throw new Error(e);
  }
});

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login');
  });
});

module.exports = router;
