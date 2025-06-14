const express = require('express');
const router = express.Router();
const controller = require('../controllers/moviesController');

router.get('/search', controller.getMovies);
router.get('/data/:imdbID', controller.getMovieData);

module.exports = router;