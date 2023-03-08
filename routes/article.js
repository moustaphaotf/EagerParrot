var express = require('express');
var router = express.Router();
const articleController = require('../controller/article');

router.get('/', articleController.articles_list);

module.exports = router;