import { Request } from "express";
import { Server } from "socket.io";

export interface Req extends Request {
  body: {
    io: Server;
  };
}
