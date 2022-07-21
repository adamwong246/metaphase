import Phaser from "phaser";
import geckos from '@geckos.io/client'
import ReactDom from "react-dom/client";
import React, { useState } from "react";

import gameConfig from "../game/index.ts";

import { udpPort } from "../../../index";
import App from "./index.tsx";

let orbLookup: Record<string, Phaser.Types.Physics.Arcade.ImageWithDynamicBody> = {};
let keys;
let physWorld;
let t = Date.now();
let lineGraphics;
let emitter;
let selfOrb;

let cleanOrbs: Record<string, boolean> = {};

document.addEventListener("DOMContentLoaded", function () {

  const channel = geckos({ port: udpPort });

  channel.onConnect(error => {
    if (error) {
      console.error(error.message)
      return
    }

    const game = new Phaser.Game({
      ...gameConfig,
      type: Phaser.CANVAS,
      scene: {
        create: function () {
          this.add.image(400, 300, 'sky');
          keys = game.scene.scenes[0].input.keyboard.addKeys('W,A,S,D');
          physWorld = new Phaser.Physics.Arcade.World(game.scene.scenes[0], {});
          lineGraphics = game.scene.scenes[0].add.graphics({ lineStyle: { width: 4, color: 0xaa00aa } });

          // var particles = game.scene.scenes[0].add.particles('red');

          // emitter = particles.createEmitter({
          //   speed: 100,
          //   scale: { start: 1, end: 0 },
          //   blendMode: 'ADD'
          // });

          selfOrb = game.scene.scenes[0].physics.add.image(0, 0, 'orb');
          channel.emit('helloFromClient', window.udpRoomUid);
        },

        preload: function () {
          this.load.setBaseURL('http://labs.phaser.io');
          this.load.image('sky', 'assets/skies/space3.png');
          this.load.image('orb', 'assets/sprites/orb-green.png');
          this.load.image('red', 'assets/particles/red.png');
        },

        update: function () {
          // if (keys.W.isDown) {
          //   channel.emit('makeMove', { go: 'up' });
          //   orbLookup[channel.id].setVelocity(orbLookup[channel.id].body.velocity.x, orbLookup[channel.id].body.velocity.y - 10);
          //   emitter.startFollow(orbLookup[channel.id]);
          //   emitter.start();
          // }
          // else if (keys.S.isDown) {
          //   channel.emit('makeMove', { go: 'down' });
          //   orbLookup[channel.id].setVelocity(orbLookup[channel.id].body.velocity.x, orbLookup[channel.id].body.velocity.y + 10);
          //   emitter.startFollow(orbLookup[channel.id]);
          //   emitter.start();
          // }
          // else if (keys.A.isDown) {
          //   channel.emit('makeMove', { go: 'left' });
          //   orbLookup[channel.id].setVelocity(orbLookup[channel.id].body.velocity.x - 10, orbLookup[channel.id].body.velocity.y);
          //   emitter.startFollow(orbLookup[channel.id]);
          //   emitter.start();
          // }
          // else if (keys.D.isDown) {
          //   channel.emit('makeMove', { go: 'right' });
          //   orbLookup[channel.id].setVelocity(orbLookup[channel.id].body.velocity.x + 10, orbLookup[channel.id].body.velocity.y);
          //   emitter.startFollow(orbLookup[channel.id]);
          //   emitter.start();
          // } else {
          //   emitter.stop();

          // }
        }
      }
    });

    ReactDom.createRoot(
      document.getElementById('body-children')
    ).render(React.createElement(App));


    channel.on('authoritativeUpdate', (dataPacket) => {
      console.log('authoritativeUpdate', dataPacket.authoritativeUpdate.intersections)

      const youLatest = dataPacket.authoritativeUpdate.you;

      const td = -1 * ((Date.now() - t) + 1);
      const diff = Math.abs(selfOrb.body.position.x - youLatest.position.x) + (selfOrb.body.position.y - youLatest.position.y);

      // if the time-delta is greater than 10 milliseconds OR the position is off by 10 pixels
      if ((td < -50 || diff > 50)) {
        // forcefully override the position and velocty;
        console.log("force", td, diff);
        selfOrb.setPosition(youLatest.position.x, youLatest.position.y)
        selfOrb.body.velocity.x = youLatest.velocity.x;
        selfOrb.body.velocity.y = youLatest.velocity.y;

      } else {
        // otherwise, "fudge" the velocity. This prevents choppy animation.
        console.log("fudge", td, diff);
        selfOrb.body.velocity.x = youLatest.velocity.x + ((selfOrb.body.position.x - youLatest.position.x) / (td));
        selfOrb.body.velocity.y = youLatest.velocity.y + ((selfOrb.body.position.y - youLatest.position.y) / (td));
      }

      lineGraphics.clear();
      dataPacket.authoritativeUpdate.intersections.forEach((ray) => {
        lineGraphics.strokeLineShape(new Phaser.Geom.Line(youLatest.position.x, youLatest.position.y, ray.x, ray.y,));
      })


      dataPacket.authoritativeUpdate.intersections.forEach((p) => {
        const o = orbLookup[p.name];
        cleanOrbs[p] = true;

        if (o) {
          if (o.active) {
            if ((td < -50 || diff > 50)) {
              // forcefully override the position and velocty;
              console.log("force", td, diff);
              orbLookup[p.name].setPosition(p.x, p.y)
              orbLookup[p.name].body.velocity.x = p.velocity.x;
              orbLookup[p.name].body.velocity.y = p.velocity.y;
              // orbLookup[p.name].body.position.x = p.x;
              // orbLookup[p.name].body.position.y = p.y;

            } else {
              // otherwise, "fudge" the velocity. This prevents choppy animation.
              console.log("fudge", td, diff);
              orbLookup[p.name].body.velocity.x = p.velocity.x + ((orbLookup[p.name].body.position.x - p.x) / td);
              orbLookup[p.name].body.velocity.y = p.velocity.y + ((orbLookup[p.name].body.position.y - p.y) / td);
            }
          } else {
            o.enableBody(true, p.x, p.y, true, true);
            o.body.velocity.x = p.velocity.x;
            o.body.velocity.y = p.velocity.y;
          }
        };
      })

      Object.keys(orbLookup).forEach((v, ndx) => {
        if (cleanOrbs[v]) {
          orbLookup[v].disableBody();
        }
        cleanOrbs[v] = false;
      })

      t = Date.now();

    });

    channel.on('removePeer', (uid: string) => {
      console.log('removePeer', uid)
      orbLookup[uid].destroy();
      delete orbLookup[uid];
    });

    channel.on('existingPeer', (peerIds: string[]) => {
      console.log('existingPeer', peerIds)

      peerIds.forEach((peerId) => {
        orbLookup[peerId] = game.scene.scenes[0].physics.add.image(0, 0, 'orb');
      })
      // if (peerId !== channel.id) {
      //   orbLookup[peerId] = game.scene.scenes[0].add.image(0, 0, 'orb');
      // }
    });

    channel.on('addPeer', (peerId: string) => {
      console.log('addPeer', peerId)
      if (peerId !== channel.id) {
        orbLookup[peerId] = game.scene.scenes[0].physics.add.image(0, 0, 'orb');
      }
    });

  });


});


