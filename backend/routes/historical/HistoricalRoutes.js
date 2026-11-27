const router = require('express').Router();
const historicalController = require('../../controllers/historical/historicalController');

router.get('/get?',historicalController.get_historical_scrip_data);
router.get('/index-chart', historicalController.get_index_chart);
router.get('/candles', historicalController.get_candles);


module.exports = router;