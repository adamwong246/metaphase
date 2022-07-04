import Phaser, { Physics } from "phaser";
import gameConfig from "../game/index.ts";

const logos = {};
let tMark;
let logoGroup;

const game = new Phaser.Game({
  ...gameConfig,
  type: Phaser.HEADLESS,
  autoFocus: false,
  physics: {
    default: 'arcade',
  },
  scene: {
    create: () => {
      logoGroup = new Phaser.Physics.Arcade.Group(new Phaser.Physics.Arcade.World(game.scene.scenes[0], {}), game.scene.scenes[0]);
    },
    update: function (time) {
      game.scene.scenes[0].physics.collide(logoGroup);

      // if (!tMark) { tMark = time }

      // if (time - tMark > 100) {
      //   tMark = time;
      //   window.authoritativeUpdate(
      //     Object.keys(logos)
      //       .map((k, v) => {

      //         const l = logos[k];

      //         return {
      //           name: l.name,
      //           position: l.body.position,
      //           velocity: l.body.velocity
      //         };

      //       })
      //   );
      // }
      window.authoritativeUpdate(
        Object.keys(logos)
          .map((k, v) => {

            const l = logos[k];

            return {
              name: l.name,
              position: l.body.position,
            };

          })
      );
    }
  },
});

window.addUser = function (uid) {
  const logo = game.scene.scenes[0].physics.add.image(400, 100, 'logo');
  logoGroup.add(logo);
  logo.setVelocity((Math.random() * 100) - 50, (Math.random() * 100) - 50);
  logo.setBounce(0.8, 0.8);
  logo.setCollideWorldBounds(true);
  logo.body.checkCollision.up = true;
  logo.body.checkCollision.down = true;
  logo.body.checkCollision.left = true;
  logo.body.checkCollision.right = true;
  logo.setName(uid);
  logos[uid] = logo;
};

window.removeUser = function (uid) {
  logos[uid].destroy();
  delete logos[uid];
};

window.moveUser = function (uid, direction) {
  if (direction === "up") {
    logos[uid].setVelocity(logos[uid].body.velocity.x, logos[uid].body.velocity.y - 10);
  }

  if (direction === "down") {
    logos[uid].setVelocity(logos[uid].body.velocity.x, logos[uid].body.velocity.y + 10);
  }
  if (direction === "right") {
    logos[uid].setVelocity(logos[uid].body.velocity.x + 10, logos[uid].body.velocity.y);
  }

  if (direction === "left") {
    logos[uid].setVelocity(logos[uid].body.velocity.x - 10, logos[uid].body.velocity.y);
  }

};

export default game;