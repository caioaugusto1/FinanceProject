'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/index.controller');
const app = express();

router.get('/', controller.get);

module.exports = router;