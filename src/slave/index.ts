import uuidv4 from "uuid/v4";
import geckos from '@geckos.io/client'
import gameConfig from "../game/index.ts";
import game from "../master";

import { channelName, udpPort } from "../index";

const channel = geckos({ port: udpPort });
const uid = uuidv4();

let logos = {};
let keys;

const game = new Phaser.Game({
  ...gameConfig,
  scene: {
    create: function () {
      this.add.image(400, 300, 'sky');
      keys = game.scene.scenes[0].input.keyboard.addKeys('W,A,S,D');

    },

    preload: function () {
      this.load.setBaseURL('http://labs.phaser.io');
      this.load.image('sky', 'assets/skies/space3.png');
      this.load.image('logo', 'assets/sprites/phaser3-logo.png');
      this.load.image('red', 'assets/particles/red.png');
    },

    update: function () {

      if (keys.W.isDown) {
        channel.emit(channelName, { go: 'up' });
      }
      if (keys.S.isDown) {
        channel.emit(channelName, { go: 'down' });
      }
      if (keys.A.isDown) {
        channel.emit(channelName, { go: 'left' });
      }
      if (keys.D.isDown) {
        channel.emit(channelName, { go: 'right' });
      }
    }
  }
});

export default game;

channel.onConnect(error => {
  if (error) {
    console.error(error.message)
    return
  }

  channel.on(channelName, message => {
    console.log(message)
    if (message.update) {
      message.update.forEach((p) => {
        if (!logos[p.name]) { logos[p.name] = game.scene.scenes[0].add.image(400, 100, 'logo') };

        logos[p.name].setPosition(p.position.x, p.position.y);
        // logos[p.name].setVelocity(p.velocity.x, p.velocity.y);

      })
    } else if (message.hello) {
      logos[message.hello] = game.scene.scenes[0].add.image(400, 100, 'logo');

      if (message.hello === uid) {
        var particles = game.scene.scenes[0].add.particles('red');

        var emitter = particles.createEmitter({
          speed: 100,
          scale: { start: 1, end: 0 },
          blendMode: 'ADD'
        });

        emitter.startFollow(logos[message.hello]);
      }
    } else if (message.goodbye) {
      console.log('goodbye', message);
      logos[message.goodbye].destroy();
      delete logos[message.goodbye]
    }

  });

  channel.emit(channelName, { hello: uid });
});

