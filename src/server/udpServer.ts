import geckos from '@geckos.io/server'

import { udpEvent, udpPort } from "../index";

const channelSession = {};

const udpServer = geckos();
udpServer.listen(udpPort);

export default (ServerState) => {
  udpServer.onConnection(channel => {
    channel.onDisconnect(() => {
      const gameChannel = channelSession[channel.id]
      if (gameChannel && ServerState.gameSessionById(gameChannel)) {
        ServerState.gameSessionById(gameChannel).game.window.removeUser(channel.id);
        udpServer.room(gameChannel).emit(udpEvent, { goodbye: channel.id });
      }
      delete channelSession[channel.id];
    });

    channel.on(udpEvent, data => {
      const { hello, go } = data;
      if (hello) {
        if (ServerState.gameSessionById(hello)) {
          channel.join(hello);
          ServerState.gameSessionById(hello).game.window.addUser(channel.id);
          udpServer.room(hello).emit(udpEvent, { hello: channel.id });
          channelSession[channel.id] = hello;
        } else {
          console.error("session not found", hello)
        }

      } else if (go) {
        ServerState.gameSessionById(channelSession[channel.id]).game.window.moveUser(channel.id, go);
      }
    })
  });

  return { udpServer, ServerState }

}