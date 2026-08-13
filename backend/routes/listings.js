const express = require('express');
const router = express.Router();

// Placeholder routes
router.get('/', (req, res) => {
    res.json({ message: 'Listings endpoint - coming soon' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Create listing - coming soon' });
});

module.exports = router;