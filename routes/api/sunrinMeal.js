const asyncify = require("express-asyncify");
const express = require("express");
const router = asyncify(express.Router());

const School = require("school-kr");
const school = new School();

const getData = async (year, month, day) => {
	const result = await school.search(School.Region.SEOUL, "선린인터넷고등학교");
	school.init(School.Type.HIGH, School.Region.SEOUL, result[0].schoolCode);

	const date = new Date();

	const meal = await school.getMeal({
		year: year,
		month: month,
		default: "급식이 없습니다",
	});
	return meal[day];
};

router.get("/", async (req, res) => {
	const { year, month, day } = req.query;
	const start = new Date();

	if (!year || !month || !day) {
		return res.status(400).json({
			code: 400,
			errorMessage: "필수 파라미터가 누락되었습니다.",
		});
	}

	const mealData = await getData(year, month, day).then(data => data.split("\n"));
	let finalData = [];

	mealData.forEach((e, index) => {
		// 알레르기 표시 번호 제거
		let characters = "1234567890./-*";
		for (let i = 0; i < characters.length; i++) {
			e = e.replaceAll(characters[i], "").replaceAll("()", "");
		}
		if (index !== 0) finalData.push(e);
	});

	return res.status(200).json({
		code: 200,
		time: `${new Date() - start}ms`,
		data: { date: `${year}${month}${day}`, meal: finalData },
	});
});

module.exports = router;
