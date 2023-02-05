require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
app.use(express.static("public"));

app.use("/", require("./routes/index"));

app.listen(port, () => console.log(`App is listening on port ${port}!`));
