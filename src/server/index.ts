import { uid } from 'uid';

import UdpServer from "./udpServer";
import HttpServer from "./httpServer";
import PhaserServer from "./phaserServer";

class ServerState {
  GameSessions: any[] = [];

  constructor() { }

  gameSessionById(newuid: string) {
    return this.GameSessions.find((gs) => gs.uid === newuid);
  }

  addSession(udpServer) {
    const newuid = uid();
    const game = PhaserServer(udpServer, newuid);
    this.GameSessions.push(
      {
        uid: newuid,
        game
      }
    )
  }
}

HttpServer(UdpServer(new ServerState()));