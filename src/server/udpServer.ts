const pm2 = require('pm2');

import geckos, { ServerChannel } from '@geckos.io/server'

import { udpPort } from "../index";

const channelIdToRoomUid = {};

const udpServer = geckos();
udpServer.listen(udpPort);

const roomIdtoPm2Id = {};

process.on('message', function (packet) {

  if (packet.data.masterReady) {
    roomIdtoPm2Id[packet.data.masterReady] = packet.data.pm_id;
  }

  if (packet.data.base64Canvas) {
    udpServer.room(`audience-${packet.data.room}`).emit('base64Canvas', packet.data.base64Canvas);
  }

  if (packet.data.authoritativeUpdate) {
    udpServer.room(`clients-${packet.data.room}`).emit('updatePeers', packet.data.authoritativeUpdate);
  }

  if (packet.data.goodbyePlayer) {
    udpServer.room(`clients-${packet.data.room}`).emit('goodbyePlayer', packet.data.goodbyePlayer);
  }
});

const pm2send = (pName: string, udpRoomUid: string, message: object) => {
  return new Promise((res, rej) => {
    pm2.list((err, list) => {
      list.forEach((p) => {
        if (p.name === pName) {
          pm2.sendDataToProcessId({
            id: p.pm_id,
            type: 'process:msg',
            data: {
              ...message,
              udpRoomUid
            },
            topic: true
          }, function (err, res) {
          });
        };
      });
    });
  });
};

udpServer.onConnection(channel => {
  console.log("onConnection", channel.id)

  // channel.on('helloFromAudience', (udpRoomUid: string) => {
  //   console.log("helloFromAudience", channel.id)
  //   channel.join(`audience-${udpRoomUid}`);
  //   // channelIdToRoomUid[channel.id] = udpRoomUid;
  // })

  channel.on('helloFromServer', (udpRoomUid: string) => {
    console.log("helloFromServer", channel.id)
    channel.join(`master-${udpRoomUid}`);
    channelIdToRoomUid[channel.id] = udpRoomUid;
  })

  channel.on('helloFromClient', (udpRoomUid: string) => {
    console.log("helloFromClient", channel.id)
    channel.join(`clients-${udpRoomUid}`);
    channelIdToRoomUid[channel.id] = udpRoomUid;
    return new Promise((res, rej) => {
      pm2.list((err, list) => {
        list.forEach((p) => {
          if (p.name === 'processServer') {
            pm2.sendDataToProcessId({
              id: p.pm_id,
              type: 'process:msg',
              data: {
                helloFromClient: channel.id,
                udpRoomUid
              },
              topic: true
            }, function (err, res) {
            });
          };
        });
      });
    });

  })

  channel.on('authUpdate', logos => {
    udpServer.room(`clients-${channelIdToRoomUid[channel.id]}`).emit('updatePeers', channel.id);
  })

  channel.on('welcomePlayer', (name: string) => {
    udpServer.room(`clients-${channelIdToRoomUid[channel.id]}`).emit('addPeer', channel.id);
  });

  channel.on('goodbyePlayer', (name: string) => {
    udpServer.room(`clients-${channelIdToRoomUid[channel.id]}`).emit('removePeer', channel.id);
  });

  channel.on('makeMove', (move: object) => {
    udpServer.room(`master-${channelIdToRoomUid[channel.id]}`).emit('movePlayer', { direction: move.go, uid: channel.id });
  });

  channel.onDisconnect(() => {
    console.log("channel.onDisconnect", channel.id, `master-${channelIdToRoomUid[channel.id]}`);
    pm2send(`processServer`, channelIdToRoomUid[channel.id], { disconnect: channel.id })

    // const clientChannel = clientChannels.find((chnl) => {
    //   chnl.channel === channel
    // });

    // if (masterChannel) {
    //   const udpRoomUid = masterChannels.find((chnl) => {
    //     chnl.channel === channel
    //   }).gameId
    //   udpServer.room(`clients-${udpRoomUid}`).emit('masterDisconnect', {});
    // } else if (clientChannel) {
    //   const udpRoomUid = clientChannels.find((chnl) => {
    //     chnl.channel === channel
    //   }).gameId
    //   masterChannels[udpRoomUid].emit('removePlayer', channel.id);
    // } else {
    //   throw ('wtf')
    // }
  });

});


