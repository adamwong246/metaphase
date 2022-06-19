import Phaser from "phaser";
import gameConfigurator from "../game/index.ts";

const gameConfig = gameConfigurator('', []);

const game = new Phaser.Game({
  ...gameConfig,
  type: Phaser.HEADLESS,
  autoFocus: false,
  scene: {
    ...gameConfig.scene,
    update: () => {
      window.authoritativeUpdate();
    }
  }
});

export default game;