const asyncify = require("express-asyncify");
const express = require("express");
const router = asyncify(express.Router());

router.get("/", async (req, res) => {
	res.send("Hello World!");
});

module.exports = router;
