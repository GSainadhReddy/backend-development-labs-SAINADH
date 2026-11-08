const express = require('express');
const lab01App = require('../lab-01/server.js');
const lab02App = require('../lab-02/index.js');
const lab03App = require('../lab-03/server.js');

const rootApp = express();

// Sub-path routing for distinct lab deployments
rootApp.use('/lab-01', lab01App);
rootApp.use('/lab-02', lab02App);
rootApp.use('/lab-03', lab03App);

// Smart routing
rootApp.use((req, res, next) => {
  if (req.url.startsWith('/books')) {
    // If query parameters from Lab 3 are used, route to Lab 3 REST API
    if (
      req.query.search_q ||
      req.query.order_by ||
      req.query.order ||
      req.query.min_price ||
      req.query.max_price ||
      req.query.limit ||
      req.query.offset
    ) {
      return lab03App(req, res, next);
    }
    return lab02App(req, res, next);
  }
  if (req.url === '/about' || req.url === '/time') {
    return lab01App(req, res, next);
  }
  return lab02App(req, res, next);
});

module.exports = rootApp;
