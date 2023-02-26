const findRemoveSync = require("find-remove");
const path = require("path");
const rootPath = path.dirname(require.main.filename);

const dataPath = path.join(rootPath, "data", "ytdl");

setInterval(() => {
	let result = findRemoveSync(dataPath, { age: { seconds: 60 * 60 * 2 }, extensions: [".mp3", ".mp4"], ignore: "*.part" });
	for (let i = 0; i < result.length; i++) {
		console.log(`[ytdl] ${result[i]} deleted.`);
	}
}, 1000 * 60 * 60 * 1);
