const apiRouter = require('./api-router.js');
const configureMiddleware = require('./configure-middleware.js');
const express = require("express");

const server = express();

configureMiddleware(server);
server.use(express.json());

server.use('/api', apiRouter);

module.exports = server;