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

	// Object.keys(mealData).forEach(e => {
	// 	let mealOfDay = mealData[e].toString();
	// 	mealOfDay = mealOfDay.split("\n");

	// 	if (mealOfDay[0] == year) return false;

	// 	finalData.push(mealOfDay);
	// });

	for (let i = 1; i <= Object.keys(mealData).length; i++) {
		let mealOfDay = mealData[i];
		mealOfDay = mealOfDay?.split("\n");

		let tempList = [];

		mealOfDay?.forEach((e, index) => {
			let characters = "1234567890./-*";
			for (let i = 0; i < characters.length; i++) {
				e = e.replaceAll(characters[i], "").replaceAll("()", "");
			}
			e.trim();

			if (e !== "[중식]") tempList.push(e);
		});

		if (mealOfDay == null) break;

		finalData.push(tempList);
	}

	return res.status(200).json({
		code: 200,
		time: `${new Date() - start}ms`,
		data: { date: `${year}${month}`, meal: finalData },
	});
});

module.exports = router;
