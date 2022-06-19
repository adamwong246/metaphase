import gameConfigurator from "../game/index.ts";
import geckos from '@geckos.io/client'

const channel = geckos({ port: 3000 }) // default port is 9208

channel.onConnect(error => {
  if (error) {
    console.error(error.message)
    return
  }

  channel.on('chat message', data => {
    console.log(`You got the message`, data)
  })

  channel.emit('chat message', 'a short message sent to the server')
});

const gameConfig = gameConfigurator(
  'http://labs.phaser.io',
  [
    ['sky', 'assets/skies/space3.png'],
    ['logo', 'assets/sprites/phaser3-logo.png'],
    ['red', 'assets/particles/red.png']
  ]
);

const game = new Phaser.Game(gameConfig);

export default game;
