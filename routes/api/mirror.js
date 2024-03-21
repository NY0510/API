const asyncify = require("express-asyncify");
const express = require("express");
const router = asyncify(express.Router());

const fs = require("fs");
const path = require("path");
const rootPath = path.dirname(require.main.filename);

const directoryPath = "/home/ny64/sync/mirror";

router.get("/", async (req, res) => {
	try {
		const start = new Date();
		const files = await fs.promises.readdir(directoryPath);
		const logFiles = files.filter((file) => path.extname(file) === ".log");

		const data = {};

		await Promise.all(
			logFiles.map(async (logFile) => {
				const filePath = path.join(directoryPath, logFile);
				const stats = await fs.promises.stat(filePath);

				const name = logFile.split(".").slice(0, -1).join(".");
				data[name] = stats.mtime;
			})
		);

		return res.status(200).json({
			code: 200,
			time: `${new Date() - start}ms`,
			data: data,
		});
	} catch (err) {
		return res.status(500).json({
			code: 500,
			time: `${new Date() - start}ms`,
			errorMessage: "Error",
		});
	}
});

module.exports = router;
