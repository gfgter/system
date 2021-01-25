const express = require('express');
const router = express.Router();
const getFile = require('./getFile')
const cors = require('../filter/cors');
const { get } = require('./getFile');
const user = require('./user')
const history = require('./history')
const circle = require('./circle')

router.use(express.json({ limit: '150mb' }), express.urlencoded({ limit: '150mb', extended: true }))
router.use(cors)

router.use('/getFile', getFile);
router.use('/nn', async(req, res) => {
    res.send('success')
})
router.use('/user', user)
router.use('/history', history)
router.use('/circle', circle)



module.exports = router;