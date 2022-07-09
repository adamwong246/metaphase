import Phaser from "phaser";
import geckos from '@geckos.io/client'

import gameConfig from "../game/index.ts";
import game from "../master";

import { udpPort } from "../../../index";

const channel = geckos({ port: udpPort });

let logos = {};
let keys;
let logoGroup;
let physWorld;

let pointers;

const game = new Phaser.Game({
  ...gameConfig,

  scene: {
    create: function () {
      this.add.image(400, 300, 'sky');
      keys = game.scene.scenes[0].input.keyboard.addKeys('W,A,S,D');

      physWorld = new Phaser.Physics.Arcade.World(game.scene.scenes[0], {});
      logoGroup = new Phaser.Physics.Arcade.Group(physWorld, game.scene.scenes[0]);
      pointers = []; //new Phaser.GameObjects.Group(game.scene.scenes[0]);

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
      logoGroup.setOrigin(0, 0);
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

  channel.on('updatePeers', (update: { balls: [], intersections: [] }) => {
    const { balls, intersections } = update;

    let min = 0;
    intersections.forEach((ntrsctn, ndx) => {
      min = ndx;
      console.log(ntrsctn, ndx);
      if (!pointers[ndx]) {
        pointers[ndx] = game.scene.scenes[0].physics.add.staticImage(ntrsctn.x, ntrsctn.y, 'redorb');
        // debugger
      } else {
        pointers[ndx].setPosition(ntrsctn.x, ntrsctn.y);
      }
    });
    for (let i = min; i < pointers.length; i++) {
      if (pointers[i]) {
        pointers[i].destroy();
        delete pointers[i]
      }

    }

    balls.forEach((p) => {
      if (!logos[p.name]) {


        logos[p.name] = game.scene.scenes[0].physics.add.image(400, 100, 'logo');
        logoGroup.add(logos[p.name]);

        // var particles = game.scene.scenes[0].add.particles('red');

        // var emitter = particles.createEmitter({
        //   speed: 10,
        //   scale: { start: 1, end: 0 },
        //   blendMode: 'ADD'
        // });

        // emitter.startFollow(logos[p.name]);



      };


      logos[p.name].body.velocity.x = p.velocity.x + ((logos[p.name].body.position.x - p.position.x) * -1);
      logos[p.name].body.velocity.y = p.velocity.y + ((logos[p.name].body.position.y - p.position.y) * -1);

      console.log("delta", (logos[p.name].body.position.x - p.position.x) + (logos[p.name].body.position.y - p.position.y));

    })
  });

  // channel.on('removePeer', (uid: string) => {
  //   logoGroup.remove(logos[uid]);
  //   logos[uid].destroy();
  //   delete logos[uid]
  // });

  channel.emit('helloFromClient', window.udpRoomUid);
});

export default (udpRoomUid) => {
  return game;
};
