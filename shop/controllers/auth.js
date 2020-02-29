const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');

const User = require('../models/User');

const transporter = nodemailer.createTransport(sendgrid({
  auth: {
    api_key: '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'
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0){
    message = message[0];
  }else{
    message = null;
  }
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage: message
  });
};

exports.getSignup = (req, res) => {
  let message = req.flash('error');
  if(message.length > 0){
    message = message[0];
  }else{
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({where:{email: email}})
    .then(user => {
      if(!user){
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if(doMatch){
            req.session.isLogged = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });

    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  console.log(password);
  User.findOne({where:{email: email}})
    .then(userDoc => {
      if(userDoc) {
        req.flash('error', 'Email already exists');
        return res.redirect('/signup');
      }
      if(password !== confirmPassword){
        req.flash('error', 'Passwords do not match');
        return res.redirect('/signup');
      }
      return bcrypt.hash(password, 8)
        .then((hashPass) => {
          const user = new User({
            email: email,
            password: hashPass
          });
          return user.save();
        })
        .then((result) => {
          res.redirect('/login');
           return transporter.sendMail({
            to: email,
            from: 'shop@node.com',
            subject: 'Signd up succeeded',
            html: '<h1>You successfully signed up</h1>'
          })
             .catch(err => console.log(err));
        });
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};