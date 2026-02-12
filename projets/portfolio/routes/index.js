const express = require("express");
const router = express.Router();

const portfolioRouter = require("./portfolioRoute");

router.use("/", portfolioRouter);

module.exports = router;
