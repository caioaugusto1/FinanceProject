'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymenttype.controller');

router.get('/', controller.get);

router.get('/create', controller.getCreate);

router.post('/', controller.post);

module.exports = router;
