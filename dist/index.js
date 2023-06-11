"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: "*" }));
io.on("connection", (socket) => {
    console.log(`${socket.id} user connected`);
    socket.on("room-code", (roomCode) => __awaiter(void 0, void 0, void 0, function* () {
        if (!roomCode)
            return;
        const res = yield prisma.room.findFirst({ where: { name: roomCode } });
        if (!res) {
            yield prisma.room.create({ data: { name: roomCode, code: "" } });
        }
        socket.join(roomCode);
    }));
    socket.on("code-send", (message) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        io.to(message.roomCode).emit("code-receive", {
            data: message.data,
            roomCode: message.clientUUID,
            codeLanguage: message.codeLanguage,
            roomUserCount: (_a = io.sockets.adapter.rooms.get(message.roomCode)) === null || _a === void 0 ? void 0 : _a.size,
        });
        yield prisma.room.update({
            where: { name: message.roomCode },
            data: { code: message.data, language: message.codeLanguage },
        });
    }));
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});
app.get("/", (_, res) => {
    res.send("Hello World");
});
app.get("/code/:room", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const room = req.params.room;
    if (!room)
        return res.status(400).send({ error: "No room code provided" });
    const roomData = yield prisma.room.findFirst({ where: { name: room } });
    if (!roomData)
        return res.status(404).send({ error: "Room not found" });
    return res.json({ code: roomData.code, language: roomData.language });
}));
httpServer.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
//# sourceMappingURL=index.js.map