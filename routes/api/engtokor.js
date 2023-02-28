const asyncify = require("express-asyncify");
const express = require("express");
const router = asyncify(express.Router());

const path = require("path");
const rootPath = path.dirname(require.main.filename);
const { engToKor } = require(`${rootPath}/lib/engToKor.js`);

router.get("/", (req, res) => {
    const { eng } = req.query;
    const start = new Date();

    if (!eng) {
        return res.status(400).json({
            code: 400,
            time: `${new Date() - start}ms`,
            errorMessage: "필수 파라미터가 누락되었습니다.",
        });
    }

    const kor = engToKor(eng);

    return res.status(200).json({
        code: 200,
        time: `${new Date() - start}ms`,
        data: { kor: kor, eng: eng },
    });
});

module.exports = router;
