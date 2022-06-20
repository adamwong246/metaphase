export default (baseUrl: string, assets: [string, string][], updater, creater) => {

  let logo;

  var config = {
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 200, x: 100 }
      }
    },
    scene: {
      preload: function () {
        this.load.setBaseURL(baseUrl)
        assets.forEach((asset) => {
          this.load.image(asset[0], asset[1])
        })
      },
      create: create,
      update: () => {
        console.log("authoritativeUpdate", logo.body.center)
        updater && updater(logo.body.center)
      }
    }
  };

  function create() {
    console.log('create!')
    this.add.image(400, 300, 'sky');

    var particles = this.add.particles('red');

    var emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD'
    });

    logo = this.physics.add.image(400, 100, 'logo');
    creater && creater(logo);
    emitter.startFollow(logo);
  }

  function authoritativeUpdate(position){
    logo.setPosition(position.x, position.y)
  }

  return {config, authoritativeUpdate};
}


