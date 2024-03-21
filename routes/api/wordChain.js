const asyncify = require("express-asyncify");
const express = require("express");
const router = asyncify(express.Router());

const axios = require("axios");
const https = require("https");

const apiKey = "BFC8F9DD3CB16A71E9212836B9F1F18B";
const baseUrl = `https://opendict.korean.go.kr/api/search?key=${apiKey}&advanced=y&sort=popular&type1=word&method=start&num=50&req_type=json&pos=1,2,6,21,22,17,8,5,21&letter_s=3&q=`;
const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
});

async function search(query) {
	const response = await axios.get(encodeURI(baseUrl + query), { httpsAgent });
	const results = await response.data.channel.item;
	let wordList = [];

	for (const item of results) {
		let jsonData = { word: item.word.replace("-", ""), description: item.sense[0].definition, type: item.sense[0].pos };
		wordList.push(jsonData);
	}

	return wordList;
}

router.get("/search", async (req, res) => {
	const { query } = req.query;
	const start = new Date();

	if (!query) {
		return res.status(400).json({
			code: 400,
			errorMessage: "필수 파라미터가 누락되었습니다.",
		});
	}

	let wordList = await search(query.slice(-1));
	let ramdomItem = wordList[Math.floor(Math.random() * wordList.length)];

	return res.status(200).json({
		code: 200,
		time: `${new Date() - start}ms`,
		data: ramdomItem === undefined ? {} : ramdomItem,
	});
});

router.get("/check", async (req, res) => {
	const { query } = req.query;
	const start = new Date();

	if (!query) {
		return res.status(400).json({
			code: 400,
			errorMessage: "필수 파라미터가 누락되었습니다.",
		});
	}

	let wordList = await search(query);
	let checkResult = wordList.find(item => item.word === query);

	return res.status(200).json({
		code: 200,
		time: `${new Date() - start}ms`,
		data: checkResult === undefined ? {} : checkResult,
	});
});

module.exports = router;
