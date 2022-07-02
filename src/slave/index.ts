import Phaser from "phaser";
import uuidv4 from "uuid/v4";
import geckos from '@geckos.io/client'
import gameConfig from "../game/index.ts";
import game from "../master";

import { udpEvent, udpPort } from "../index";

const channel = geckos({ port: udpPort });

let logos = {};
let keys;
let logoGroup;

const game = new Phaser.Game({
  ...gameConfig,
  scene: {
    create: function () {
      this.add.image(400, 300, 'sky');
      keys = game.scene.scenes[0].input.keyboard.addKeys('W,A,S,D');
      logoGroup = new Phaser.GameObjects.Group(this, []);

    },

    preload: function () {
      this.load.setBaseURL('http://labs.phaser.io');
      this.load.image('sky', 'assets/skies/space3.png');
      this.load.image('logo', 'assets/sprites/orb-green.png');
      this.load.image('red', 'assets/particles/red.png');
    },

    update: function () {

      if (keys.W.isDown) {
        channel.emit(udpEvent, { go: 'up' });
      }
      if (keys.S.isDown) {
        channel.emit(udpEvent, { go: 'down' });
      }
      if (keys.A.isDown) {
        channel.emit(udpEvent, { go: 'left' });
      }
      if (keys.D.isDown) {
        channel.emit(udpEvent, { go: 'right' });
      }
    }
  }
});



channel.onConnect(error => {
  console.log("onConnect", channel.id, error);
  if (error) {
    console.error(error.message)
    return
  }

  channel.on(udpEvent, message => {
    console.log(message)

    if (message.update) {
      message.update.forEach((p) => {


        if (!logos[p.name]) {
          logos[p.name] = game.scene.scenes[0].add.image(400, 100, 'logo');
          logoGroup.add(logos[p.name]);
        };

        logos[p.name].setPosition(p.position.x, p.position.y);

      })
    } else if (message.hello) {
      logos[message.hello] = game.scene.scenes[0].add.image(400, 100, 'logo');
      logoGroup.add(logos[message.hello]);

      if (message.hello === channel.id) {
        var particles = game.scene.scenes[0].add.particles('red');

        var emitter = particles.createEmitter({
          speed: 100,
          scale: { start: 1, end: 0 },
          blendMode: 'ADD'
        });

        emitter.startFollow(logos[message.hello]);
      }
    } else if (message.goodbye) {
      logoGroup.remove(logos[message.goodbye]);
      logos[message.goodbye].destroy();
      delete logos[message.goodbye]
    }

  });

  channel.emit(udpEvent, { hello: localStorage.getItem('udpRoomUid') });
});

export default (udpRoomUid) => {
  return game;
};