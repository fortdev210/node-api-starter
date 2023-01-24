"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
dotenv_1.default.config();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use((0, morgan_1.default)("combined")); //todo remove in prod?
app.get("/", (req, res) => {
    //todo remove
    res.send("TRIM Express App");
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map