const { Router } = require('express');
const Course = require('../models/course');
const auth = require('../middlewares/auth');
const { validationResult } = require('express-validator');
const { courseValidator } = require('../utils/validators');
const router = Router();

router.get('/', async (req, res) => {
  const courses = await Course.find().populate('userId').lean();

  res.render('courses', {
    title: 'Courses',
    isCourses: true,
    courses,
  });
});

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) return res.redirect('/');

  const course = await Course.findById(req.params.id).lean();

  res.render('edit', {
    title: `Edit - ${course.title}`,
    course,
  });
});

router.post('/edit', courseValidator, auth, async (req, res) => {
  try {
    const { id } = req.body;
    const errors = validationResult(req);

    //Check for errors
    if (!errors.isEmpty()) {
      return res.status(422).redirect(`/courses/${id}/edit?allow=true`);
    }

    //If no errors
    delete req.body.id;
    await Course.findByIdAndUpdate(id, req.body);
    res.redirect('/courses');
  } catch (e) {
    throw new Error(e);
  }
});

router.post('/remove', auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
    });
    res.redirect('/courses');
  } catch (e) {
    throw new Error(e);
  }
});

router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id).lean();
  res.render('course', {
    layout: 'empty',
    title: `Course - ${course.title}`,
    course,
  });
});

module.exports = router;
