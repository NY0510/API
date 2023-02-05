require("dotenv").config();
require("colors");
const express = require("express");
const app = express();
const fs = require("fs");

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.use(express.static("public"));

app.use("/", require("./routes/index"));
fs.readdirSync("./routes/api").forEach(file => {
	try {
		app.use(`/${file.split(".")[0]}`, require(`./routes/api/${file}`));
		console.log(`✔`.green, `Loaded route ${file.bold}`.white);
	} catch (e) {
		console.log(`✖`.red, `Failed to load route ${file.bold}`.white, `\n${String(e.stack)}`);
	}
});

app.listen(port, () => console.log(`App is listening on port ${port}!`));
