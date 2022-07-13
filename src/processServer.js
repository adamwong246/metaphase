const pm2 = require('pm2');
const { uid } = require('uid');

// import { pm2Send } from "./server/pm2Helper";

process.on('message', function (packet) {
  console.log(packet.data, packet.data.udpRoomUid);

  if (packet.data.goodbyePlayer) {
    new Promise((res, rej) => {
      pm2.list((err, list) => {
        list.forEach((p) => {
          if (p.name === `masterServer-${packet.data.goodbyePlayer}`) {
            list.forEach((p2) => {
              if (p2.name === 'udp') {
                const payload = {
                  id: p2.pm_id,
                  type: 'process:msg',
                  data: {
                    ...packet.data,
                    pm_id: p.pm_id
                  },
                  topic: true
                };
                pm2.sendDataToProcessId(payload, function (err, res) {
                });
              };
            });
          };
        });
      });
    });
  }

  if (packet.data.goodbyePlayer) {
    new Promise((res, rej) => {
      pm2.list((err, list) => {
        list.forEach((p) => {
          if (p.name === `masterServer-${packet.data.masterReady}`) {
            list.forEach((p2) => {
              if (p2.name === 'udp') {
                const payload = {
                  id: p2.pm_id,
                  type: 'process:msg',
                  data: {
                    ...packet.data,
                    pm_id: p.pm_id
                  },
                  topic: true
                };
                pm2.sendDataToProcessId(payload, function (err, res) {
                });
              };
            });
          };
        });
      });
    });
  }

  if (packet.data.disconnect) {
    new Promise((res, rej) => {
      pm2.list((err, list) => {
        list.forEach((p) => {
          if (p.name === `masterServer-${packet.data.udpRoomUid}`) {
            const payload = {
              id: p.pm_id,
              type: 'process:msg',
              data: packet.data,
              topic: true
            };
            pm2.sendDataToProcessId(payload, function (err, res) {
            });
          }
        }
        )
      })
    })
  }

  if (packet.data.helloFromClient) {

    // pm2Send(
    //   (p) => p.name === `masterServer-${packet.data.udpRoomUid}`,
    //   packet.data,
    // );
    new Promise((res, rej) => {
      pm2.list((err, list) => {
        let sender;
        list.forEach((p) => {
          if (p.name === `masterServer-${packet.data.udpRoomUid}`) {

            const payload = {
              id: p.pm_id,
              type: 'process:msg',
              data: packet.data,
              topic: true
            };
            console.log("payload", payload);

            pm2.sendDataToProcessId(payload, function (err, res) {
            });
          }
        }
        )
      })
    })
  }

  if (packet.data.base64Canvas) {
    new Promise((res, rej) => {
      pm2.list((err, list) => {
        list.forEach((p) => {
          if (p.name === `masterServer-${packet.data.room}`) {
            list.forEach((p2) => {
              if (p2.name === 'udp') {
                const payload = {
                  id: p2.pm_id,
                  type: 'process:msg',
                  data: {
                    ...packet.data,
                    pm_id: p.pm_id
                  },
                  topic: true
                };
                pm2.sendDataToProcessId(payload, function (err, res) {
                });
              };
            });
          };
        });
      });
    });
  }

  if (packet.data.bootMasterServer) {
    const newuid = uid();
    pm2.start({
      script: `./webpack/dist/masterServer.bundle.js`,
      name: `masterServer-${newuid}`,
      args: newuid
    }, function (err, apps) {
      if (err) {
        console.error(err)
        return pm2.disconnect()
      } else {
        console.log(`masterServer-${newuid} launched!`)
      }
    })
  }

  if (packet.data.masterReady) {
    new Promise((res, rej) => {
      pm2.list((err, list) => {
        list.forEach((p) => {
          if (p.name === `masterServer-${packet.data.masterReady}`) {
            list.forEach((p2) => {
              if (p2.name === 'udp') {
                const payload = {
                  id: p2.pm_id,
                  type: 'process:msg',
                  data: {
                    ...packet.data,
                    pm_id: p.pm_id
                  },
                  topic: true
                };
                pm2.sendDataToProcessId(payload, function (err, res) {
                });
              };
            });
          };
        });
      });
    });
  }
});

pm2.connect(function (err) {
  if (err) {
    console.error("pm2 fail", err)
    process.exit(2)
  }

  pm2.list((err, list) => {
    list.filter((n) => n.name.match(/masterServer-.*/g)).forEach((p) => {
      pm2.restart(p.pm_id, function (err, res) {
        console.log(err, res)
      });
    });
  });

  pm2.start({
    script: './webpack/dist/udp.bundle.js',
    name: 'udp'
  }, function (err, apps) {
    if (err) {
      console.error(err)
      return pm2.disconnect()
    } else {
      console.log('udp server launched')
    }
  })

  pm2.start({
    script: './webpack/dist/http.bundle.js',
    name: 'http'
  }, function (err, apps) {
    if (err) {
      console.error(err)
      return pm2.disconnect()
    } else {
      console.log('http server launched')
    }
  })
})

