const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const express = require('express');
const proxy = require('http-proxy-middleware');

const onProxyRes = (proxyRes, req, res) => {
  proxyRes.headers['access-control-allow-origin'] = '*';
};

// proxy middleware options
const options = {
  target: process.env.PROXY_TARGET, // target host
  changeOrigin: true, // needed for virtual hosted sites
  secure: false,
  logLevel: 'debug',
  onProxyRes
};

const proxyHandler = proxy(options);

const app = express();
app.use('/', function(req, res, next) {
  console.log(req.ip);
  next();
}, proxyHandler);

app.listen(3001);
