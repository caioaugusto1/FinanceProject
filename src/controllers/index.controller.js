'use strict';

exports.get = (req, res, next) => {
    res.status(200).send({
        title: 'NODE API', 
        version: '0.0.2'
    })
};
