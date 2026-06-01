const express = require('express');
const router = express.Router();

router.post('/initiate', async (req, res) => {
  res.json({ message: 'Payment coming soon', status: 'pending' });
});

router.post('/success', async (req, res) => {
  res.json({ message: 'Payment success' });
});

router.post('/fail', async (req, res) => {
  res.json({ message: 'Payment failed' });
});

module.exports = router;
