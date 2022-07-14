import Phaser, { Physics } from "phaser";
import PhaserRaycaster from "phaser-raycaster";

import gameConfig from "../game/index.ts";

const orbLookup = {};
let orbGroup;
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
      orbGroup = new Phaser.Physics.Arcade.Group(physWorld, game.scene.scenes[0]);

      raycaster = this.raycasterPlugin.createRaycaster();
      ray = raycaster.createRay({
        origin: {
          x: 400,
          y: 300
        },
        autoSlice: true,
        detectionRange: 100,
        enablePhysics: 'arcade'
      });
      window.masterReady();
    },
    update: function (time) {
      game.scene.scenes[0].physics.collide(orbGroup);

      const childs = orbGroup.getChildren();
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

      const orbs = Object.keys(orbLookup)
        .map((k, v) => {
          const l = orbLookup[k];

          if (l.body) {
            return {
              name: l.name,
              position: l.body.position,
              velocity: l.body.velocity,
            };
          }

        }).filter((x) => x);

      window.authoritativeUpdate({
        intersections,
        orbs
      });
    }
  },
});

window.addPlayer = function (uid) {
  console.log("window.addPlayer")
  const orb = game.scene.scenes[0].physics.add.image(400, 100, 'orb').setOrigin(0, 0);
  orbGroup.add(orb);
  orb.setVelocity((Math.random() * 500), (Math.random() * 500));
  orb.setBounce(0.99, 0.99);
  orb.setCollideWorldBounds(true);
  orb.body.checkCollision.up = true;
  orb.body.checkCollision.down = true;
  orb.body.checkCollision.left = true;
  orb.body.checkCollision.right = true;
  orb.body.maxSpeed = 700;
  orb.setName(uid);
  orbLookup[uid] = orb;
  return true;
}

window.removePlayer = function (uid) {
  console.log("window.removePlayer", uid)
  raycaster.removeMappedObjects(orbLookup[uid]);
  orbGroup.remove(orbLookup[uid], true, true);
  window.goodbyePlayer(uid);
}

window.movePlayer = function ({ uid, direction }) {
  if (direction === "up") {
    orbLookup[uid].setVelocity(orbLookup[uid].body.velocity.x, orbLookup[uid].body.velocity.y - 10);
  }

  if (direction === "down") {
    orbLookup[uid].setVelocity(orbLookup[uid].body.velocity.x, orbLookup[uid].body.velocity.y + 10);
  }
  if (direction === "right") {
    orbLookup[uid].setVelocity(orbLookup[uid].body.velocity.x + 10, orbLookup[uid].body.velocity.y);
  }

  if (direction === "left") {
    orbLookup[uid].setVelocity(orbLookup[uid].body.velocity.x - 10, orbLookup[uid].body.velocity.y);
  }
}
