"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    console.log(req.io);
    res.send("Welcome to route");
});
exports.default = router;
//# sourceMappingURL=ws.js.map