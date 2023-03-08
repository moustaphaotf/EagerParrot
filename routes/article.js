var express = require('express');
var router = express.Router();
const articleController = require('../controller/article');

router.get('/', articleController.articles_list);
router.get('/new', articleController.article_create_get);
router.post('/new', articleController.article_create_post);

module.exports = router;