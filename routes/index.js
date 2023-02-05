const asyncify = require("express-asyncify");
const express = require("express");
const router = asyncify(express.Router());

router.get("/", async (req, res) => {
	res.render("index");
});

module.exports = router;
