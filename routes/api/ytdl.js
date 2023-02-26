const asyncify = require("express-asyncify");
const express = require("express");
const router = asyncify(express.Router());

const path = require("path");
const fs = require("fs");
const ytdlp = require("youtube-dl-exec");

const rootPath = path.dirname(require.main.filename);

function checkVideoId(id) {
	return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

router.get("/download", (req, res) => {
	const { file } = req.query;

	if (!file) {
		return res.status(400).json({
			code: 400,
			errorMessage: "필수 파라미터가 누락되었습니다.",
		});
	}

	const filePath = path.join(rootPath, "data", "ytdl", file);

	if (!fs.existsSync(filePath)) {
		return res.status(404).json({
			code: 404,
			errorMessage: "파일이 존재하지 않습니다.",
		});
	}

	res.download(filePath, err => {
		// console.log(`[ytdl] ${filePath} deleted.`);
		// fs.unlinkSync(filePath);
	});
});

router.get("/", (req, res) => {
	const query = req.query;
	const start = new Date();

	const { id, filetype } = query;

	if (!id || !filetype) {
		return res.status(400).json({
			code: 400,
			time: `${new Date() - start}ms`,
			errorMessage: "필수 파라미터가 누락되었습니다.",
		});
	}

	if (filetype !== "audio" && filetype !== "video") {
		return res.status(400).json({
			code: 400,
			time: `${new Date() - start}ms`,
			errorMessage: "filetype 파라미터가 올바르지 않습니다.",
		});
	}

	// console.log(!checkVideoId(id));

	if (!checkVideoId(id)) {
		return res.status(400).json({
			code: 400,
			time: `${new Date() - start}ms`,
			errorMessage: "유효하지 않은 영상 ID 입니다.",
		});
	}

	if (fs.existsSync(path.join(rootPath, "data", "ytdl", `${id}.${filetype === "audio" ? "mp3" : "mp4"}`))) {
		return res.status(200).json({
			code: 200,
			time: `${new Date() - start}ms`,
			data: { url: `https://api.ny64.kr/ytdl/download?file=${id}.${filetype === "audio" ? "mp3" : "mp4"}`, cached: true },
		});
	}

	const url = `https://youtube.com/watch?v=${id}`;
	console.log(`[ytdl] ${url} requested as ${filetype}.`);

	const options = {
		output: path.join(rootPath, "data", "ytdl", "%(id)s.%(ext)s"),
		noWarnings: true,
		// quiet: true,
	};
	filetype === "audio"
		? ((options.extractAudio = true), (options.audioFormat = "mp3"), (options.audioQuality = 0))
		: (options.format = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4");

	const subprocess = ytdlp.exec(url, options);
	subprocess.on("error", error => {
		return res.status(500).json({
			code: 500,
			time: `${new Date() - start}ms`,
			errorMessage: error,
		});
	});

	subprocess.stdout.on("data", data => {
		const text = data.toString();
		let filePath;

		// console.log(text);

		if (filetype === "audio") {
			if (text.includes("[ExtractAudio]")) {
				text.split(" /")
					.filter((item, index) => index === 1)
					.forEach(item => {
						filePath = "/" + item.split(";")[0].trim();
					});
			}
		} else if (filetype === "video") {
			if (text.includes("[Merger]")) {
				text.split(' "/')
					.filter((item, index) => index === 1)
					.forEach(item => {
						if (item.includes("mp4")) filePath = "/" + item.split('"')[0].trim();
					});
			}
		}

		if (filePath !== undefined) {
			filePath = path.basename(filePath);

			console.log(`[ytdl] ${filePath} downloaded.`);
			return res.status(200).json({
				code: 200,
				time: `${new Date() - start}ms`,
				data: { url: `http://api.ny64.kr/ytdl/download?file=${filePath}`, cached: false, expiration: 60 * 60 * 2 },
			});
		}
	});
});

module.exports = router;
