const { Router } = require('express');
const Course = require('../models/course');
const auth = require('../middlewares/auth');
const { validationResult } = require('express-validator');
const { courseValidator } = require('../utils/validators');
const router = Router();

router.get('/', auth, (req, res) => {
  res.render('add', {
    title: 'Add Course',
    isAdd: true,
  });
});

router.post('/', auth, courseValidator, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('add', {
        title: 'Add Course',
        isAdd: true,
        error: errors.array()[0].msg,
        data: {
          title: req.body.title,
          price: req.body.price,
          img: req.body.img,
        },
      });
    }
    // const course = new Course(req.body.title, req.body.price, req.body.img);
    const course = new Course({
      title: req.body.title,
      price: req.body.price,
      img: req.body.img,
      userId: req.user,
    });
    await course.save();
    res.redirect('/courses');
  } catch (e) {
    throw new Error(e);
  }
});

module.exports = router;
