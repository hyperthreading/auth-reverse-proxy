const path = require('path');
const fs = require('fs');

let config = {
  target: 'http://localhost:3000',
  secret: '123123',
  allowedIps: ['::ffff:127.0.0.1', '::1', '127.0.0.1'],
  port: 3001
};

if (fs.existsSync(path.resolve(process.cwd(), './config'))) {
  config = require('./config');
}

const express = require('express');
const morgan = require('morgan');
const proxy = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');

const options = {
  target: config.target,
  changeOrigin: true,
  secure: false,
};

const proxyHandler = proxy(options);
const cookieName = 'auth_session';
const app = express();

app.use(cookieParser(config.secret));
app.use(morgan('combined'));
app.use('/', function(req, res, next) {
  if (req.signedCookies[cookieName]) {
    const validCookie = Number(req.signedCookies[cookieName]) > new Date().getTime();
    if (validCookie) {
      next();
      return;
    }
  }

  if (config.allowedIps.includes(req.ip)) {
    const expireAt = new Date().getTime() + 1000 * 60 * 60 * 24 * 3;

    res.cookie(cookieName, expireAt, {
      maxAge: 1000 * 60 * 60 * 24 * 3,
      httpOnly: true,
      sameSite: true,
      signed: true,
    });
    next();
    return;
  }

  res.status(401).send("Unauthorized");

}, proxyHandler);

app.listen(config.port);
