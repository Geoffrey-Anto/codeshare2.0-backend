require("dotenv").config();
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const prisma = new PrismaClient();
app.use(express.json());
app.use(cors({ origin: "*" }));

io.on("connection", (socket) => {
  console.log(`${socket.id} user connected`);

  socket.on("room-code", async (roomCode) => {
    if (!roomCode) return;

    const res = await prisma.room.findFirst({ where: { name: roomCode } });

    if (!res) {
      await prisma.room.create({ data: { name: roomCode, code: "" } });
    }

    socket.join(roomCode);
  });

  socket.on("code-send", async (message) => {
    io.to(message.roomCode).emit("code-receive", {
      data: message.data,
      roomCode: message.clientUUID,
      codeLanguage: message.codeLanguage,
      roomUserCount: io.sockets.adapter.rooms.get(message.roomCode)?.size,
    });

    await prisma.room.update({
      where: { name: message.roomCode as string },
      data: { code: message.data as string, language: message.codeLanguage },
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.get("/", (_, res) => {
  res.send("Hello World");
});

app.get("/code/:room", async (req, res) => {
  const room = req.params.room;
  if (!room) return res.status(400).send({ error: "No room code provided" });

  const roomData = await prisma.room.findFirst({ where: { name: room } });

  if (!roomData) return res.status(404).send({ error: "Room not found" });

  return res.json({ code: roomData.code, language: roomData.language });
});

httpServer.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
