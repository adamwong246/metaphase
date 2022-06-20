import Phaser from "phaser";
import gameConfigurator from "../game/index.ts";

export default new Phaser.Game({
  ...(gameConfigurator('', [], function (x) {
    window.authoritativeUpdate(x);
  }, function (logo) {
    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);
  }).config),
  type: Phaser.HEADLESS,
  autoFocus: false,
});