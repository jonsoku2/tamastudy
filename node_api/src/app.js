require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const hpp = require('hpp');
const helmet = require('helmet');
const app = express();
require('./passport')();
const routes = require('./routes');
require('./db/mysqlConnector');

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  app.use(
    morgan('combined'),
    helmet(),
    hpp(),
    cors({ origin: process.env.FRONT_URI_PROD, credentials: true })
  );
} else {
  app.use(
    morgan('dev'),
    cors({ origin: process.env.FRONT_URI_DEV, credentials: true })
  );
}

app.use(
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true }),
  cookieParser(process.env.COOKIE_SECRET),
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
      // node_api.tamastudy.com <-> tamastudy.com 간에 쿠키 공유가 될것이다.
      domain: isProd && '.tamastudy.com',
      maxAge: 1000 * 60 * 60, // 1 hour
      // maxAge: 5000,
    },
  }),
  passport.initialize(),
  passport.session()
);

app.use(routes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🌏 Server listening on ${PORT}`);
});