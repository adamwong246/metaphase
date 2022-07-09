import Phaser, { Physics } from "phaser";
import PhaserRaycaster from "phaser-raycaster";

import gameConfig from "../game/index.ts";

// console.log("PhaserRaycaster", PhaserRaycaster());

const logos = {};
let logoGroup;
let t = 0;
let physWorld;
var raycaster;
var ray;
var intersections;

const game = new Phaser.Game({
  ...gameConfig,
  type: Phaser.HEADLESS,
  autoFocus: false,

  plugins: {
    scene: [
      {
        key: 'PhaserRaycaster',
        plugin: PhaserRaycaster,
        mapping: 'raycasterPlugin'
      }
    ]
  },

  scene: {
    create: function () {
      physWorld = new Phaser.Physics.Arcade.World(game.scene.scenes[0], {});
      logoGroup = new Phaser.Physics.Arcade.Group(physWorld, game.scene.scenes[0]);

      // console.log(game.scene.scenes[0].plugins)
      raycaster = this.raycasterPlugin.createRaycaster();


      //create ray
      ray = raycaster.createRay({
        origin: {
          x: 400,
          y: 300
        }
      });
      // console.log("ray", ray);

      // raycaster.mapGameObjects(logoGroup.getChildren(), true);


      window.masterReady();
    },
    update: function (time) {
      game.scene.scenes[0].physics.collide(logoGroup);
      raycaster.mapGameObjects(logoGroup.getChildren(), true);
      intersections = ray.castCircle();
      console.log(logoGroup.getChildren())
      t++
      if (t > 1) {
        window.authoritativeUpdate({
          intersections,
          balls: Object.keys(logos)
            .map((k, v) => {
              const l = logos[k];
              return {
                name: l.name,
                position: l.body.position,
                velocity: l.body.velocity,
              };
            })
        });
        t = 0;
      }


    }
  },
});

window.addPlayer = (uid) => {
  console.log("window.addPlayer")
  const logo = game.scene.scenes[0].physics.add.image(400, 100, 'logo').setOrigin(0, 0);
  logoGroup.add(logo);
  logo.setVelocity((Math.random() * 1000) - 500, (Math.random() * 1000) - 500);
  logo.setBounce(0.99, 0.99);
  logo.setCollideWorldBounds(true);
  logo.body.checkCollision.up = true;
  logo.body.checkCollision.down = true;
  logo.body.checkCollision.left = true;
  logo.body.checkCollision.right = true;
  logo.body.maxSpeed = 10000;
  logo.setName(uid);
  logos[uid] = logo;
  return true;
}

window.removePlayer = (uid) => {
  logos[uid].destroy();
  channel.emit('goodbyePlayer', uid);
  delete logos[uid];
}

window.movePlayer = ({ uid, direction }) => {
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
}
