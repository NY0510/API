const asyncify = require("express-asyncify");
const express = require("express");
const router = asyncify(express.Router());

const fs = require("fs");
const os = require("os");

async function getNetworkUsage(interfaceName) {
	try {
		const data = await fs.promises.readFile("/proc/net/dev", "utf8");
		const lines = data.trim().split("\n");
		const interfaceLine = lines.find(line => line.includes(interfaceName));
		if (!interfaceLine) {
			throw new Error(`Interface ${interfaceName} not found in /proc/net/dev`);
		}
		const stats = interfaceLine.split(": ")[1].split(/\s+/);
		const receivedBytes = parseInt(stats[0]);
		const transmittedBytes = parseInt(stats[8]);
		return { receivedBytes, transmittedBytes };
	} catch (err) {
		console.error(err);
		return { receivedBytes: 0, transmittedBytes: 0 };
	}
}

router.get("/", async (req, res) => {
	const start = new Date();
	const uptime = os.uptime();
	const { receivedBytes, transmittedBytes } = await getNetworkUsage("eth0");

	return res.status(200).json({
		code: 200,
		time: `${new Date() - start}ms`,
		data: { rx: receivedBytes, tx: transmittedBytes, uptime: uptime },
	});
});

module.exports = router;
