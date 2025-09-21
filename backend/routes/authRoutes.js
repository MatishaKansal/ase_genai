const {login , signup, logout}  = require ("../controllers/authController.js");
const express=  require ("express");
const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);

module.exports = router;