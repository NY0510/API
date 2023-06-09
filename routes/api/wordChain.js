const asyncify = require("express-asyncify");
const express = require("express");
const router = asyncify(express.Router());

const axios = require("axios");
const cheerio = require("cheerio");

const wordListCache = {};
const wordCache = {};

const getRandomElementFromSet = set => {
	const size = set.size;
	const randomIndex = Math.floor(Math.random() * size);
	let currentIndex = 0;

	for (const element of set) {
		if (currentIndex === randomIndex) {
			return element;
		}
		currentIndex++;
	}
};

const getWordList = async firstChar => {
	if (wordListCache[firstChar]) return wordListCache[firstChar];

	const url = `https://kkukowiki.kr/w/역대_단어/한국어/${firstChar}`;

	try {
		const response = await axios.get(encodeURI(url));

		if (response.status === 200) {
			const html = response.data;
			const $ = cheerio.load(html);
			const table = $("table.sortable");
			const rows = table.find("tr > td > a");
			const wordSet = new Set();

			rows.each((i, e) => {
				let text = $(e).text();
				if (text.length > 1) wordSet.add(text);
			});

			wordListCache[firstChar] = wordSet;

			return wordSet;
		}
	} catch (e) {
		console.log(`Error: ${e.message}`);
		return new Set();
	}
};

const checkWord = async word => {
	if (wordCache[word]) return wordCache[word];

	const firstChar = word.charAt(0);
	const wordList = await getWordList(firstChar);
	const result = wordList.has(word);

	wordCache[word] = result;

	return result;
};

router.get("/nextWord", async (req, res) => {
	const { word } = req.query;
	const start = new Date();

	if (!word) {
		return res.status(400).json({
			code: 400,
			errorMessage: "필수 파라미터가 누락되었습니다.",
		});
	}

	const result = await getWordList(word);

	return res.status(200).json({
		code: 200,
		time: `${new Date() - start}ms`,
		data: { result: getRandomElementFromSet(result) },
	});
});

router.get("/check", async (req, res) => {
	const { word } = req.query;
	const start = new Date();

	if (!word) {
		return res.status(400).json({
			code: 400,
			errorMessage: "필수 파라미터가 누락되었습니다.",
		});
	}

	const result = await checkWord(word);

	return res.status(200).json({
		code: 200,
		time: `${new Date() - start}ms`,
		data: { result: result },
	});
});

module.exports = router;
