const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const bookmarks = require('../store');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route('/')
  .get((req, res) => {
    res
      .json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    let { title, url, rating = '', desc } = req.body;

    if (!title) {
      logger.error('Title is required.');
      return res
        .status(400)
        .send('Invalid data');
    }

    if (!url) {
      logger.error('URL is required.');
      return res
        .status(400)
        .send('Invalid data');
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      logger.error('URL must begin with http:// or https://');
      return res
        .status(400)
        .send('Invalid data');
    }

    const numberRating = parseFloat(rating);
    if (isNaN(numberRating) && rating !== '') {
      logger.error('If entered, rating must be a number.');
      return res
        .status(400)
        .send('Invalid data oawjefoijawofa');
    }
    if (numberRating > 5 || numberRating < 1) {
      logger.error('If entered, rating must be a number between 1 and 5.');
      return res
        .status(400)
        .send('Invalid data');
    }

    if (!desc) {
      logger.error('Description is required.');
      return res
        .status(400)
        .send('Invalid data');
    }

    const id = uuid();
    const bookmark = {
      id,
      title,
      url,
      rating: String(numberRating),
      desc
    };

    bookmarks.push(bookmark);

    logger.info(`Bookmark with id ${id} created.`);

    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark);
  });

bookmarkRouter
  .route('/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(b => b.id === parseInt(id));

    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res
        .status(404)
        .send('Bookmark not found.');
    }
    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;

    const bookmarkIndex = bookmarks.findIndex(b => b.id === parseInt(id));

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res
        .status(404)
        .send('Not found');
    }
    bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with id ${id} deleted.`);

    res
      .status(204)
      .end();
  });

module.exports = bookmarkRouter;