var express = require('express');
var router = express.Router();
const userController = require('../controller/user');

router.get('/', (req, res, next) => {
    res.redirect('/user/signin');
});
router.get('/signin', userController.signin_get);
router.post('/signin', userController.signin_post);
router.post('/signup', userController.signup_post);
router.get('/signup', userController.signup_get);
router.get('/signout', userController.signout);

module.exports = router;