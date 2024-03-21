const asyncify = require("express-asyncify");
const express = require("express");
const router = asyncify(express.Router());
const Timetable = require("comcigan-parser");
const timetable = new Timetable();
let result;

(async () => {
	await timetable.init({ cache: 1000 * 60 * 60 });
	const school = await timetable.search("선린인터넷고");
	timetable.setSchool(school[0].code);
	result = await timetable.getTimetable();
})();

router.get("/:grade/:class", async (req, res) => {
	const start = new Date();
	const gradeNum = req.params.grade,
		classNum = req.params.class;

	return res.status(200).json({
		code: 200,
		time: `${new Date() - start}ms`,
		data: result[gradeNum][classNum],
	});
});

router.get("/classList", async (req, res) => {
	const start = new Date();

	const classList = [];

	for (const grade in result) {
		for (const _class in result[grade]) {
			const classString = `${grade}-${_class}`;
			classList.push(classString);
		}
	}

	return res.status(200).json({
		code: 200,
		time: `${new Date() - start}ms`,
		data: classList,
	});
});

module.exports = router;
