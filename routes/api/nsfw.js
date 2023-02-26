const asyncify = require("express-asyncify");
const express = require("express");
const router = asyncify(express.Router());

const request = require("request");

router.get("/", (req, res) => {
	const query = req.query;
	const start = new Date();
	const categoryList = ["waifu", "neko", "trap", "blowjob"];

	// category 파라미터 categotyList 포함 => 해당 파라미터로
	//                                아니면 => categoryList 랜덤
	let category = categoryList.includes(query.category) ? query.category : categoryList[Math.floor(Math.random() * categoryList.length)];

	request({ url: `https://api.waifu.pics/nsfw/${category}`, json: true }, (error, response, body) => {
		const fileUrl = body.url;

		if (error) {
			return res.status(500).json({
				code: 500,
				time: `${new Date() - start}ms`,
				errorMessage: error,
			});
		} else {
			return res.status(200).json({
				code: 200,
				time: `${new Date() - start}ms`,
				data: { url: fileUrl, type: fileUrl.split(".").pop(), category: category },
			});
		}
	});
});

module.exports = router;
