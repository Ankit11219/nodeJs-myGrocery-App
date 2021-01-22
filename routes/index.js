var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(404).json({message: 'no such path found'});
});

router.post('/qwerty', (req, res) => {
  console.log('testing');
  res.status(200).json({message: 'Postman you are good'})
});

router.delete('/qwerty', (req, res) => {
  const {password} = req.body;
  console.log('testing',password);
  res.send()
});

module.exports = router;
