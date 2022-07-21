import Phaser, { Physics } from "phaser";
import PhaserRaycaster from "phaser-raycaster";

import gameConfig from "../game/index.ts";

const orbLookup = {};
let orbGroup;
let t = 0;
let physWorld;
var raycaster;
// var ray;
var intersections

let rayLookup = {};

type IRay = any;
const raysByChannelId: Record<string, IRay> = {};

const groupBy = (x, f) => x.reduce((a, b) => ((a[f(b)] ||= []).push(b), a), {});

let LAST_FRAME_TIME = performance.now();

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

      window.addPlayer = function (uid) {
        const orb = game.scene.scenes[0].physics.add.image(400, 300, 'orb').setOrigin(0, 0);
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

        const ray = raycaster.createRay({
          origin: {
            x: orb.body.position.x,
            y: orb.body.position.y
          },
          autoSlice: false,
          detectionRange: 200,
          enablePhysics: 'arcade'
        });
        rayLookup[uid] = ray;
        raycaster.mapGameObjects(orbGroup.getChildren(), true);
        window.helloPlayer(uid);
        return true;
      }

      window.removePlayer = function (uid) {
        if (orbLookup[uid]) {
          raycaster.removeMappedObjects(orbLookup[uid]);
          orbGroup.remove(orbLookup[uid], true, true);
        }

        // rayLookup[uid].destroy();
        delete raysByChannelId[uid];
        window.goodbyePlayer(uid);
      }

      window.makeMove = function (uid, move) {
        const direction = move.go;

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

      window.masterReady();
    },

    update: function (time) {

      console.log(1 / ((performance.now() - LAST_FRAME_TIME) / 1000));
      LAST_FRAME_TIME = performance.now();

      game.scene.scenes[0].physics.collide(orbGroup);

      const childs = orbGroup.getChildren();

      Object.keys(orbLookup).forEach((orb, ndx, r) => {
        const ray = rayLookup[orb];
        const playerOrb = orbLookup[orb].body;
        ray.setOrigin(playerOrb.position.x, playerOrb.position.y);

        // raycaster.mapGameObjects(childs, true);
        // ray.castCircle();

        const inFov = groupBy(ray.castCircle()
          .filter((ntrsctn) => {
            if (ntrsctn.object && ntrsctn.segment) {
              return ntrsctn.object;
            }
          }), (v) => v.object.name);

        intersections = Object.keys(inFov).map((i, ndx, rry) => {
          return {
            x: inFov[i][0].object.body.x,
            y: inFov[i][0].object.body.y,
            name: inFov[i][0].object.name,
            velocity: inFov[i][0].object.body.velocity
          }
        });

        window.authoritativeUpdate(orb, {
          you: {
            position: playerOrb.position,
            velocity: playerOrb.velocity,
          },
          intersections,
          // inFov: ray.intersections.map((i) => {
          //   return {
          //     name: i.name,
          //     position: i.position,
          //     velocity: i.velocity
          //   }
          // })
        });
      })

      // const orbs = Object.keys(orbLookup)
      //   .map((k, v) => {
      //     const l = orbLookup[k];
      //     if (l.body) {
      //       return {
      //         name: l.name,
      //         position: l.body.position,
      //         velocity: l.body.velocity,
      //       };
      //     }
      //   }).filter((x) => x);
      // window.authoritativeUpdate({
      //   intersections,
      //   orbs
      // });
    }
  },
});


