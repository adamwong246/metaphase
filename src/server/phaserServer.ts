const pm2 = require('pm2');

import http from "http";
import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const masterBundle = fs.readFileSync("./webpack/dist/master.bundle.js").toString();

const newuid = process.argv[2];

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


// <script type="text/javascript" src = "https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js" > </script>
// < script type = "text/javascript" src = "https://cdn.jsdelivr.net/npm/phaser-raycaster@0.10.4/dist/phaser-raycaster.min.js" > </script>

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
              if (typeof cb !== 'function') return 0 // this line saves a lot of cpu
              window.setTimeout(() => cb(0), 1)
              return 0
            }
            window.requestAnimationFrame = cb => animationFrame(cb)

            window.authoritativeUpdate = (authUpdate) => {
              pm2.sendDataToProcessId({
                id: p.pm_id,
                type: 'process:msg',
                data: {
                  room: newuid,
                  authoritativeUpdate: authUpdate
                },
                topic: true
              }, function (err, res) {
              });

            }

            process.on('message', function (packet) {
              console.log("phaserServer message!", packet);
              if (packet.data.helloFromClient) {
                window.addPlayer(packet.data.helloFromClient)
              }
            });

            window.masterReady = () => {
              console.log("window.masterReady")
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
          },
        }
      );
    };
  });
});


console.log("hello phaserServer");