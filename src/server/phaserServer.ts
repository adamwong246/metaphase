import jsdom from "jsdom";
import fs from "fs";
import http from "http";
import path from "path";

import { udpEvent, udpPort } from "../index";

const { JSDOM } = jsdom;

const masterBundle = fs.readFileSync("./webpack/dist/master.bundle.js").toString();

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

export default (udpServer, newuid) => {
  const vClient = new JSDOM(
    `
<!DOCTYPE html>
  <script>${masterBundle}</script>
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
          udpServer.room(newuid).emit(udpEvent, { update: data })
        };

      },
    }
  );

  return vClient;
}