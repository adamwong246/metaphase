import gameConfig from "../game/index.ts";
import geckos from '@geckos.io/client'

const channel = geckos({ port: 3000 });

let logo;

export default new Phaser.Game({
  ...gameConfig,
  scene: {
    create: function () {
      this.add.image(400, 300, 'sky');
  
      var particles = this.add.particles('red');
  
      var emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
      });
  
      logo = this.add.image(400, 100, 'logo');
      emitter.startFollow(logo);
    },

    preload: function () {
      this.load.setBaseURL('http://labs.phaser.io');
      this.load.image('sky', 'assets/skies/space3.png');
      this.load.image('logo', 'assets/sprites/phaser3-logo.png');
      this.load.image('red', 'assets/particles/red.png');
    }
  }
});


channel.onConnect(error => {
  if (error) {
    console.error(error.message)
    return
  }

  channel.on('chat message', position => {
    logo.setPosition(position.x, position.y)
  });

  channel.emit('chat message', 'a short message sent to the server');
});

