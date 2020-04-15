const { body } = require('express-validator');
const User = require('../models/user');

exports.registerValidator = [
  body('email')
    .isEmail()
    .withMessage('The email you entered is invalid')
    .custom(async (value, req) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject('Email already exists');
        }
      } catch (e) {
        throw new Error(e);
      }
    })
    .normalizeEmail(),
  body('password', 'Min length of password is 6 chars')
    .isLength({
      min: 6,
      max: 56,
    })
    .trim(),
  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
    .trim(),
  body('name')
    .isLength({ min: 2 })
    .withMessage('Min length of name is 2 chars')
    .isAlpha()
    .withMessage('Name can only consist of letters')
    .trim(),
];

exports.courseValidator = [
  body('title')
    .isLength({ min: 3 })
    .withMessage('Min length of title is 3 chars')
    .trim(),
  body('price').isNumeric().withMessage('Price can be only numeric'),
  body('img').isURL().withMessage('Image URL is invalid'),
];
