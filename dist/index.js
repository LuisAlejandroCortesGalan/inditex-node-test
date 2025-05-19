"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config/config"));
const PORT = config_1.default.port;
const server = app_1.default.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
process.on('uncaughtException', error => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(error);
    process.exit(1);
});
process.on('unhandledRejection', error => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(error);
    server.close(() => {
        process.exit(1);
    });
});
exports.default = server;
//# sourceMappingURL=index.js.map