const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");

router.post('/signup', userCtrl.signup);

const limit = require("../middleware/limiter");

// via limit.loginLimiter : interdire le visiteur à se connecter plus de 3 fois en 5 minutes
router.post('/login', limit.loginLimiter, userCtrl.login);

module.exports = router;
