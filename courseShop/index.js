const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const csrf = require('csurf');
const flash = require('connect-flash');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoSession = require('connect-mongodb-session')(session);
const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const varMiddleware = require('./middlewares/variables');
const userMiddleware = require('./middlewares/user');
const fileMiddleware = require('./middlewares/file');
const errorHandler = require('./middlewares/error');
const keys = require('./keys/index');

const app = express();
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
});

const AllSessions = new MongoSession({
  collection: 'sessions',
  uri: keys.DB.DB_URL,
});

//View Engine
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

//Register static
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({ extended: true }));

//Sessions
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: AllSessions,
  })
);

//File Upload Middleware
app.use(fileMiddleware.single('avatar'));

//CSRF Token
app.use(csrf());

//Flash messages
app.use(flash());

//Custom Middlewares
app.use(varMiddleware);
app.use(userMiddleware);

//Routes
app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

//Route Errors
app.use(errorHandler);

//Server
const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    //Database
    await mongoose.connect(keys.DB.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (e) {
    throw e;
  }
};

start();
