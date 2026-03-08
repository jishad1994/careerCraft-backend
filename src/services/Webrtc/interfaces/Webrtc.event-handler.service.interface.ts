import { Server, Socket } from "socket.io";

export interface IWebRTCEventHandler {
    register(socket: Socket, io: Server):Promise<void>;
}
