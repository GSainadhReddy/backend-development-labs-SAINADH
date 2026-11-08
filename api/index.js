const express = require('express');
const lab01App = require('../lab-01/server.js');
const lab02App = require('../lab-02/index.js');
const lab03App = require('../lab-03/server.js');

const rootApp = express();

// Sub-path routing
rootApp.use('/lab-01', lab01App);
rootApp.use('/lab-02', lab02App);
rootApp.use('/lab-03', lab03App);

// Smart routing: /books and root route to lab-02; /about and /time to lab-01
rootApp.use((req, res, next) => {
  if (req.url.startsWith('/books')) {
    return lab02App(req, res, next);
  }
  if (req.url === '/about' || req.url === '/time') {
    return lab01App(req, res, next);
  }
  return lab02App(req, res, next);
});

module.exports = rootApp;
