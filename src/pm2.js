const pm2 = require('pm2');

pm2.launchBus(function (err, pm2_bus) {
  if (err) return console.error(err);
})

pm2.connect(function (err) {
  if (err) {
    console.error("pm2 fail", err)
    process.exit(2)
  }

  pm2.start({
    script: './src/processServer.js',
    name: 'processServer'
  }, function (err, apps) {
    if (err) {
      console.error(err)
      return pm2.disconnect()
    }
  })

})
console.log("hello metaphase!")
// process.exit(0)