import Phaser from "phaser";
import gameConfigurator from "../game/index.ts";

const gameConfig = gameConfigurator('', [], function (x) {
  window.authoritativeUpdate(x);
});

const game = new Phaser.Game({
  ...gameConfig,
  type: Phaser.HEADLESS,
  autoFocus: false,
});

export default game;