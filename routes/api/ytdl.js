const asyncify = require("express-asyncify");
const express = require("express");
const router = asyncify(express.Router());

const path = require("path");
const fs = require("fs");
const ytdlp = require("youtube-dl-exec");

const rootPath = path.dirname(require.main.filename);

async function checkVideoId(id) {
	const url = "http://img.youtube.com/vi/" + id + "/mqdefault.jpg";
	const { status } = await fetch(url);
	if (status === 404) return false;
	return true;
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

	if (checkVideoId(id)) {
		return res.status(400).json({
			code: 400,
			time: `${new Date() - start}ms`,
			errorMessage: "유효하지 않은 영상 ID 입니다.",
		});
	}

	const url = `https://youtube.com/watch?v=${id}`;
	const options = {
		output: path.join(rootPath, "data", "ytdl", "%(id)s.%(ext)s"),
		noWarnings: true,
		// quiet: true,
	};
	filetype === "audio" ? ((options.extractAudio = true), (options.audioFormat = "mp3")) : (options.format = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4");

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

		if (text.includes("[ExtractAudio]") || text.includes("[download]")) {
			text.split(" /")
				.filter((item, index) => index === 1)
				.forEach(item => {
					if (filetype === "audio") filePath = "/" + item.split(";")[0].trim();
					else {
						if (item.includes("mp4")) filePath = "/" + item.split(" has")[0].trim();
					}
				});
		}

		if (filePath !== undefined) {
			filePath = path.basename(filePath);

			return res.status(200).json({
				code: 200,
				time: `${new Date() - start}ms`,
				data: { url: `http://localhost/ytdl/download?file=${filePath}`, expiration: 60 * 60 * 2 },
			});
		}
	});
});

module.exports = router;
