const express = require('express');
const bodyParser = require('body-parser');
const errorHandlerMiddleware = require('./middlewares/errorHandler');
const notFoundMiddleWare = require('./middlewares/notFound');

const routes = require('./routes');

const app = express();

app.use(bodyParser.json());
app.use(routes);
app.use(errorHandlerMiddleware);
app.use(notFoundMiddleWare);

module.exports = app;
