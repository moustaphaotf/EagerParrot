var express = require('express');
const mediaController = require("../controller/media");

var router = express.Router();

router.post('/new', mediaController.new_media);
router.post('/delete', mediaController.delete_media);

module.exports = router;
