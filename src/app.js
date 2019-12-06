require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const bookmarkRouter = require('./bookmarks/bookmarks-router');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

// Middleware pipeline
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

// Authorization
app.use(function validationCheckpoint(req, res, next) {
  const API_Key = process.env.API_TOKEN;
  const User_API_Key = req.get('Authorization');

  if (!User_API_Key || User_API_Key.split(' ')[1] !== API_Key) {
    return res
      .status(401)
      .json({ error: 'Not a valid API key' });
  }
  next();
});
app.use('/bookmarks', bookmarkRouter);

// Error handling functions
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;