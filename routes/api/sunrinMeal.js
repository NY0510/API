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
	return meal;
};

router.get("/", async (req, res) => {
	const { year, month } = req.query;
	const start = new Date();

	if (!year || !month) {
		return res.status(400).json({
			code: 400,
			errorMessage: "필수 파라미터가 누락되었습니다.",
		});
	}

	const mealData = await getData(year, month);
	// console.log(Object.keys(mealData).length);
	let finalData = [];

	Object.keys(mealData).forEach(e => {
		let mealOfDay = mealData[e].toString();
		mealOfDay = mealOfDay.split("\n");

		finalData.push(mealOfDay);
	});

	return res.status(200).json({
		code: 200,
		time: `${new Date() - start}ms`,
		data: { date: `${year}${month}`, meal: finalData },
	});
});

module.exports = router;
