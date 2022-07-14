import Phaser from "phaser";
import geckos from '@geckos.io/client'

import gameConfig from "../game/index.ts";
import game from "../master";

import { udpPort } from "../../../index";

let orbLookup = {};
let keys;
let physWorld;
let t = Date.now();
let lineGraphics;

const channel = geckos({ port: udpPort });

const game = new Phaser.Game({
  ...gameConfig,
  type: Phaser.WEBGL,

  scene: {
    create: function () {
      this.add.image(400, 300, 'sky');
      keys = game.scene.scenes[0].input.keyboard.addKeys('W,A,S,D');
      physWorld = new Phaser.Physics.Arcade.World(game.scene.scenes[0], {});
      game.scene.scenes[0].add.circle(400, 300, 100, 0x0000FF);
      lineGraphics = game.scene.scenes[0].add.graphics({ lineStyle: { width: 4, color: 0xaa00aa } });
    },

    preload: function () {
      this.load.setBaseURL('http://labs.phaser.io');
      this.load.image('sky', 'assets/skies/space3.png');
      this.load.image('logo', 'assets/sprites/orb-green.png');
      // this.load.image('logo', 'assets/sprites/phaser3-logo.png');
      this.load.image('red', 'assets/particles/blue.png');
      this.load.image('redorb', 'assets/sprites/orb-red.png');
    },

    update: function () {
      if (keys.W.isDown) {
        channel.emit('makeMove', { go: 'up' });
      }
      if (keys.S.isDown) {
        channel.emit('makeMove', { go: 'down' });
      }
      if (keys.A.isDown) {
        channel.emit('makeMove', { go: 'left' });
      }
      if (keys.D.isDown) {
        channel.emit('makeMove', { go: 'right' });
      }
    }
  }
});

channel.onConnect(error => {
  if (error) {
    console.error(error.message)
    return
  }
  console.log("udp connected")

  // channel.on('addPeer', (channelId: string) => {
  //   logos[channelId] = game.scene.scenes[0].add.image(400, 100, 'logo');
  //   logoGroup.add(logos[channelId]);

  //   if (channelId === channel.id) {
  //     var particles = game.scene.scenes[0].add.particles('red');

  //     var emitter = particles.createEmitter({
  //       speed: 100,
  //       scale: { start: 1, end: 0 },
  //       blendMode: 'ADD'
  //     });

  //     emitter.startFollow(logos[channelId]);
  //   }
  // });

  channel.on('updatePeers', (update: { orbs: [], intersections: [] }) => {
    // console.log(update)
    const { orbs, intersections } = update;


    lineGraphics.clear();
    intersections.forEach((ray) => {
      lineGraphics.strokeLineShape(new Phaser.Geom.Line(400, 300, ray.x, ray.y,));
    })

    orbs.forEach((p) => {
      if (!orbLookup[p.name]) {
        orbLookup[p.name] = game.scene.scenes[0].physics.add.image(p.position.x, p.position.y, 'logo');
      };

      // orbLookup[p.name].setPosition(p.position.x, p.position.y)
      // orbLookup[p.name].body.velocity.x = p.velocity.x;
      // orbLookup[p.name].body.velocity.y = p.velocity.y;

      const td = -1 * ((Date.now() - t) + 1);
      const diff = Math.abs(orbLookup[p.name].body.position.x - p.position.x) + (orbLookup[p.name].body.position.y - p.position.y);

      // if the time-delta is greater than 10 milliseconds OR the position is off by 10 pixels
      // forcefully override the position and velocty;
      if ((td < -10 || diff > 20)) {

        console.log("force", td, diff);
        orbLookup[p.name].setPosition(p.position.x, p.position.y)
        orbLookup[p.name].body.velocity.x = p.velocity.x;
        orbLookup[p.name].body.velocity.y = p.velocity.y;
        // orbLookup[p.name].body.position.x = p.position.x;
        // orbLookup[p.name].body.position.y = p.position.y;
        // otherwise, "fudge" the velocity. This prevents choppy animation.
      } else {
        console.log("fudge", td, diff);
        orbLookup[p.name].body.velocity.x = p.velocity.x + ((orbLookup[p.name].body.position.x - p.position.x) / (td));
        orbLookup[p.name].body.velocity.y = p.velocity.y + ((orbLookup[p.name].body.position.y - p.position.y) / (td));
      }
      t = Date.now();
      // console.log("delta", td, (orbLookup[p.name].body.position.x - p.position.x) + (orbLookup[p.name].body.position.y - p.position.y));
      // console.log("delta", td);

    })
  });

  channel.on('goodbyePlayer', (uid: string) => {
    orbLookup[uid].destroy();
    delete orbLookup[uid];
  });

  channel.emit('helloFromClient', window.udpRoomUid);
});

export default (udpRoomUid) => {
  return game;
};
