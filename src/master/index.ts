import Phaser, { Physics } from "phaser";
import gameConfig from "../game/index.ts";

let logo;

export default new Phaser.Game({
  ...gameConfig,
  type: Phaser.HEADLESS,
  autoFocus: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200, x: 100 }
    }
  },
  scene: {
      update: () => {
        window.authoritativeUpdate(logo.body.center);
      },
      create: function () {
        logo = this.physics.add.image(400, 100, 'logo');
        logo.setVelocity(100, 200);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);
      }
  }
});
