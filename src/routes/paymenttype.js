'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controller/paymenttype.controller');

router.get('/', controller.get);

router.post('/', controller.post);

module.exports = router;
