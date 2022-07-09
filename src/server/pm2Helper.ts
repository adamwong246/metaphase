const pm2 = require('pm2');

export const pm2Recieve = (callback) => {
  process.on('message', function (packet) {
    callback(packet)
  })
};

export const pm2Send = async (checker, data, callback = (err, res) => { }) => {
  new Promise((res, rej) => {
    pm2.list((err, list) => {
      let sender;
      list.forEach((p) => {
        // if (p.name === `masterServer-${packet.data.udpRoomUid}`) {
        if (checker(p)) {

          const payload = {
            id: p.pm_id,
            type: 'process:msg',
            topic: true,
            data,
          };
          console.log("payload", payload);

          pm2.sendDataToProcessId(payload, callback);
        }
      }
      )
    })
  })
}