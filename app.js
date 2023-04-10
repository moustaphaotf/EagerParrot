var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require("dotenv");
const session = require("express-session");

dotenv.config();

var indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const articleRouter = require('./routes/article');
const mediaRouter = require("./routes/media");

const Database = require('./model/Database')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session setup
const secret = process.env.SESSION_SECRET;
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 604800000} // a week
}));

// database setup
Database.create();

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/articles', articleRouter);
app.use('/media', mediaRouter);
app.get('/populate', Database.populate);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
