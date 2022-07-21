const pm2 = require('pm2');

import geckos, { ServerChannel } from '@geckos.io/server'
// import WebRTCConnection from '@geckos.io/server/lib/wrtc/webrtcConnection';

import { udpPort } from "../index";

const peers: Record<string, string[]> = {};
const channelIdToRoomUid = {};
const channels: Record<string, any> = {};

const udpServer = geckos();
udpServer.listen(udpPort);

const roomIdtoPm2Id = {};

process.on('message', function (packet) {

  if (packet.data.masterReady) {
    roomIdtoPm2Id[packet.data.masterReady] = packet.data.pm_id;
  }

  if (packet.data.authoritativeUpdate) {
    const channel = channels[packet.data.toChannelId];

    if (channel) {
      channel.emit('authoritativeUpdate', packet.data);
    } else {
      // console.log('no such channel exists?!', packet.data.toChannelId)
    }

  }

  if (packet.data.helloPlayer) {
    // udpServer.room(`clients-${packet.data.udpRoomUid}`).emit('addPeer', packet.data.helloPlayer);
    (peers[packet.data.udpRoomUid] || []).forEach((peerId) => {
      channels[peerId].emit('addPeer', packet.data.helloPlayer);
    })

    channels[packet.data.helloPlayer].emit('existingPlayers', peers[packet.data.udpRoomUid]);

    peers[packet.data.udpRoomUid] = [
      ...(peers[packet.data.udpRoomUid] || []),
      packet.data.helloPlayer
    ]



  }

  if (packet.data.goodbyePlayer) {
    udpServer.room(`clients-${packet.data.udpRoomUid}`).emit('removePeer', packet.data.goodbyePlayer);
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

  channel.on('makeMove', (move: object) => {
    return new Promise((res, rej) => {
      pm2.list((err, list) => {
        list.forEach((p) => {
          if (p.name === 'processServer') {
            pm2.sendDataToProcessId({
              id: p.pm_id,
              type: 'process:msg',
              data: {
                makeMove: channel.id,
                move,
                udpRoomUid: channelIdToRoomUid[channel.id]
              },
              topic: true
            }, function (err, res) {
            });
          };
        });
      });
    });
  });

  channel.on('helloFromServer', (udpRoomUid: string) => {
    channel.join(`master-${udpRoomUid}`);
    channelIdToRoomUid[channel.id] = udpRoomUid;
  })

  channel.on('helloFromClient', (udpRoomUid: string) => {
    console.log('hello', udpRoomUid, channel.id)
    channel.join(`clients-${udpRoomUid}`);
    channels[channel.id] = channel;

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
  });

  // channel.on('helloPlayer', (name: string) => {
  //   console.log("helloPlayer", channel.id)
  //   udpServer.room(`clients-${channelIdToRoomUid[channel.id]}`).emit('addPeer', channel.id);
  // });

  // channel.on('goodbyePlayer', (name: string) => {
  //   console.log("goodbyePlayer", channel.id)
  //   udpServer.room(`clients-${channelIdToRoomUid[channel.id]}`).emit('removePeer', channel.id);
  // });

  // channel.on('makeMove', (move: object) => {
  //   udpServer.room(`master-${channelIdToRoomUid[channel.id]}`).emit('movePlayer', { direction: move.go, uid: channel.id });
  // });
  // channel.on('authUpdate', logos => {
  //   udpServer.room(`clients-${channelIdToRoomUid[channel.id]}`).emit('updatePeers', channel.id);
  // })

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


