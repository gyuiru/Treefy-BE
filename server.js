"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var cors_1 = __importDefault(require("cors"));
var dotenv_1 = __importDefault(require("dotenv"));
var mysql2_1 = __importDefault(require("mysql2"));
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
dotenv_1.default.config();
var connection = mysql2_1.default.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
connection.connect(function (err) {
    if (err) {
        console.error('disconnected DB :' + err.stack);
        return;
    }
    console.log('connected DB');
    app.listen(process.env.PORT, function () {
        console.log('connected server');
    });
});
app.get('/', function (_req, res) {
    res.sendFile(path_1.default.join(__dirname, '../treefy-fe/dist/index.html'));
});
