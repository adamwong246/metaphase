const pm2 = require('pm2');

import http from "http";
import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const masterBundle = fs.readFileSync("./webpack/dist/master.bundle.js").toString();

const newuid = process.argv[2];
let LAST_FRAME_TIME = performance.now();

class FakeXMLHttpRequest {
  url;
  status = 200;
  response;
  responseText;

  open(_type, url) {
    this.url = path.resolve(__dirname, url);
  }

  send() {
    http
      .get(this.url.split('/Users/adam/Code/spacetrash_v3/dev/')[1], (resp) => {
        let data = "";

        resp.setEncoding('base64');

        resp.on("data", (chunk) => {
          data += chunk;
        });

        resp.on("end", () => {
          this.response = data
          this.responseText = data
          const event = { target: { status: this.status } }
          this.onload(this, event)
        });
      })
      .on("error", (err) => {
        console.log("Error: " + err.message);
      });
  }
  onload(xhr, event) { }
  onerror(err) { }
  onprogress() { }
};

pm2.list((err, list) => {
  list.forEach((p) => {
    if (p.name === 'udp') {

      const vdom = new JSDOM(`
<!DOCTYPE html>
  <script>window.udpRoomUid = '${newuid}';</script>
  
  <script>${masterBundle}</script>
  
      `,
        {
          url: "https://example.org/",
          runScripts: "dangerously",
          resources: "usable",
          pretendToBeVisual: true,

          beforeParse: (window) => {

            window.XMLHttpRequest = FakeXMLHttpRequest;

            window.URL.createObjectURL = (base64) => {
              return `data:image/png;base64, ${base64}`
            };

            window.URL.revokeObjectURL = () => { };

            const animationFrame = (cb: any) => {
              // console.log(1 / ((performance.now() - LAST_FRAME_TIME) / 1000));
              LAST_FRAME_TIME = performance.now();

              if (typeof cb !== 'function') return 0 // this line saves a lot of cpu
              window.setTimeout(() => cb(0), 1)
              return 0
            }
            window.requestAnimationFrame = cb => animationFrame(cb)

            window.authoritativeUpdate = (toChannelId, authUpdate) => {
              // console.log(toChannelId, authUpdate)
              pm2.sendDataToProcessId({
                id: p.pm_id,
                type: 'process:msg',
                data: {
                  room: newuid,
                  authoritativeUpdate: authUpdate,
                  toChannelId
                },
                topic: true
              }, function (err, res) {
              });

            }

            process.on('message', function (packet) {
              if (packet.data.makeMove) {
                window.makeMove(packet.data.makeMove, packet.data.move)
              }

              if (packet.data.helloFromClient) {
                window.addPlayer(packet.data.helloFromClient)
              }
              if (packet.data.disconnect) {
                window.removePlayer(packet.data.disconnect)
              }
            });

            window.masterReady = () => {
              return new Promise((res, rej) => {
                pm2.list((err, list) => {
                  list.forEach((p) => {
                    if (p.name === 'processServer') {
                      pm2.sendDataToProcessId({
                        id: p.pm_id,
                        type: 'process:msg',
                        data: {
                          masterReady: newuid
                        },
                        topic: true
                      }, function (err, res) {
                      });
                    };
                  });
                });
              });
            }

            window.helloPlayer = (uid) => {
              console.log("window.helloPlayer", uid)
              return new Promise((res, rej) => {
                pm2.list((err, list) => {
                  list.forEach((p) => {
                    if (p.name === 'processServer') {
                      pm2.sendDataToProcessId({
                        id: p.pm_id,
                        type: 'process:msg',
                        data: {
                          helloPlayer: uid,
                          udpRoomUid: newuid
                        },
                        topic: true
                      }, function (err, res) {
                      });
                    };
                  });
                });
              });
            }

            window.goodbyePlayer = (goodbyeUid) => {
              console.log("window.goodbyePlayer", goodbyeUid)
              return new Promise((res, rej) => {
                pm2.list((err, list) => {
                  list.forEach((p) => {
                    if (p.name === 'processServer') {
                      pm2.sendDataToProcessId({
                        id: p.pm_id,
                        type: 'process:msg',
                        data: {
                          goodbyePlayer: goodbyeUid,
                          udpRoomUid: newuid
                        },
                        topic: true
                      }, function (err, res) {
                      });
                    };
                  });
                });
              });
            }

          },
        }
      );
    };
  });
});


console.log("hello phaserServer");