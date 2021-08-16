var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');

var usersRouter = require('./routes/users');
// var indexRouter = require('./routes/index');
var assetRouter = require('./routes/Assets');
var chainRouter = require('./routes/Chain')
var requestsRouter = require('./routes/Requests')
var transactionRouter = require('./routes/transaction')

var config = require('./config');
var secretConfig = require('./secretConfig');

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

mongoose.connect(secretConfig.mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.connection.on('connected', () => {
  console.log("connected to mongo yeahh")
})

mongoose.connection.on('error', (err) => {
  console.log("this is error", err)
})

var app = express();
// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Handling CORS Errors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(path.join(__dirname, 'public'),{index:["index.html","index.htm"]}));

// app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/assets', assetRouter);
app.use('/chain',chainRouter);
app.use('/transaction',transactionRouter);
app.use('/requests',requestsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
