console.log('hello master');

import Phaser from "phaser";
import gameConfig from "../game/index.ts";
  
export default  new Phaser.Game({
  ...gameConfig,
  type: Phaser.HEADLESS,
  autoFocus: false,
})
  
  
