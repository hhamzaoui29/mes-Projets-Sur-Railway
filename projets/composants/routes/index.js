const express = require("express");
const router = express.Router();

const composantsRouter = require("./composantsRoute");

router.use("/", composantsRouter);

module.exports = router;
