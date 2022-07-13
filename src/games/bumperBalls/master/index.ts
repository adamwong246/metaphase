import Phaser, { Physics } from "phaser";
import PhaserRaycaster from "phaser-raycaster";

import gameConfig from "../game/index.ts";

const logos = {};
let logoGroup;
let t = 0;
let physWorld;
var raycaster;
var ray;
var intersections

const groupBy = (x, f) => x.reduce((a, b) => ((a[f(b)] ||= []).push(b), a), {});

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

      raycaster = this.raycasterPlugin.createRaycaster();
      ray = raycaster.createRay({
        origin: {
          x: 400,
          y: 300
        },
        autoSlice: true,  //automatically slice casting result into triangles
        detectionRange: 100,
        enablePhysics: 'arcade'
      });

      ray.enablePhysics();
      window.masterReady();
    },
    update: function (time) {

      game.scene.scenes[0].physics.collide(logoGroup);

      const childs = logoGroup.getChildren();
      console.log("childs", childs.length)
      raycaster.mapGameObjects(childs, true);
      ray.castCircle(childs);
      const rays = groupBy(ray.intersections
        .filter((ntrsctn) => {
          if (ntrsctn.object && ntrsctn.segment) {
            return ntrsctn.object;
          }
        }), (v) => v.object.name);

      intersections = Object.keys(rays).map((v, ndx, rry) => {
        return {
          x: rays[v][0].object.body.x,
          y: rays[v][0].object.body.y,
          name: rays[v][0].object.name,
        }
      });


      const balls = Object.keys(logos)
        .map((k, v) => {
          const l = logos[k];
          return {
            name: l.name,
            position: l.body.position,
            velocity: l.body.velocity,
          };
        });

      console.log("balls", balls.length)
      t++;
      if (t > 1) {
        window.authoritativeUpdate({
          objects: intersections,
          balls
        });
        t = 0;
      }
    }
  },
});

window.addPlayer = function (uid) {
  console.log("window.addPlayer")
  const logo = game.scene.scenes[0].physics.add.image(400, 100, 'logo').setOrigin(0, 0);
  logoGroup.add(logo);
  logo.setVelocity((Math.random() * 500), (Math.random() * 500));
  logo.setBounce(0.99, 0.99);
  logo.setCollideWorldBounds(true);
  logo.body.checkCollision.up = true;
  logo.body.checkCollision.down = true;
  logo.body.checkCollision.left = true;
  logo.body.checkCollision.right = true;
  logo.body.maxSpeed = 700;
  logo.setName(uid);
  logos[uid] = logo;
  return true;
}

window.removePlayer = function (uid) {
  console.log("window.removePlayer", uid)
  logoGroup.remove(logos[uid], true, true);
  window.goodbyePlayer(uid);
}

window.movePlayer = function ({ uid, direction }) {
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
