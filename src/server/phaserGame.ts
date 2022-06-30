import jsdom from "jsdom";
import fs from "fs";
import path from "path";
import http from "http";

import geckos from '@geckos.io/server'

import {channelName, udpPort} from "../index";

const io = geckos();
const { JSDOM } = jsdom;

const connections = {};

class FakeXMLHttpRequest {
  url;
  status = 200;
  response;
  responseText;

  open(_type, url) {
    this.url = path.resolve(__dirname, url);
  }

  send() {
    const cleanUrl = this.url.split('/Users/adam/Code/spacetrash_v3/dev/')[1];
    http
      .get(cleanUrl, (resp) => {
        let data = "";

        resp.setEncoding('base64');

        // A chunk of data has been received.
        resp.on("data", (chunk) => {
          // console.log("data", chunk);
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          // console.log("end", JSON.parse(data).explanation);
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

export const PhaserGame = async () => {
  const vdom = new JSDOM(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Webpack App</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script>
      ${fs.readFileSync("./dist/master.bundle.js").toString()}
    </script>
      </head>
      <body>
      </body>
    </html>
    `,
    {
      url: "https://example.org/",
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: false,

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

        window.authoritativeUpdate = (data) => {
          io.room(undefined).emit(channelName, {update: data})
        };

      },
    }
  );

  io.onConnection(channel => {
    channel.onDisconnect(() => {
      vdom.window.removeUser(connections[channel.id]);
      io.room(undefined).emit(channelName, {goodbye: connections[channel.id]});
      delete connections[channel.id];
    });

    channel.on(channelName, data => {
      if (data.hello){
        vdom.window.addUser(data.hello);
        io.room(undefined).emit(channelName, {hello: data.hello});
        connections[channel.id] = data.hello;
      } else if (data.go){
        vdom.window.moveUser(connections[channel.id], data.go);
      }

    })
  });

  io.listen(udpPort);
};
