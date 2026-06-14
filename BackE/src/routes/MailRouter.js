const express = require('express');
const router = express.Router();
const { sendTestEmail } = require('../services/MailService');

// POST /api/mail/test
router.post('/test', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ status: 'ERR', message: 'Email là bắt buộc' });
  }
  const result = await sendTestEmail(email);
  if (result.status === 'OK') {
    return res.json(result);
  } else {
    return res.status(500).json(result);
  }
});

module.exports = router;
