export default (baseUrl: string, assets: [string, string][]) => {
  var config = {
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 200 }
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
      update: () => console.log('update!')
    }
  };

  function create() {
    console.log('create')
    this.add.image(400, 300, 'sky');

    var particles = this.add.particles('red');

    var emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD'
    });

    var logo = this.physics.add.image(400, 100, 'logo');

    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    emitter.startFollow(logo);
  }

  return config;
}

