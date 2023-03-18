var express = require('express');
var router = express.Router();
const articleController = require('../controller/article');
const userController = require("../controller/user");

router.get('/', articleController.articles_list);
router.get('/new', articleController.article_create_get);
router.post('/new', articleController.article_create_post);
router.get('/:id', articleController.article_details);
router.get('/:id/edit', articleController.article_edit_get);
router.post('/:id/edit', articleController.article_edit_post);
router.get('/:id/publish', [
    articleController.article_publish, 
    articleController.article_published_change
]);
router.get('/:id/unpublish', [
    articleController.article_unpublish, 
    articleController.article_published_change
]);
router.post('/:id/comment', articleController.article_new_comment);
router.get('/:id/like', [
    userController.user_logged,
    articleController.article_exists,
    articleController.article_like,
    articleController.article_review_change
]);

router.get('/:id/dislike', [
    userController.user_logged,
    articleController.article_exists,
    articleController.article_dislike,
    articleController.article_review_change
]);

module.exports = router;