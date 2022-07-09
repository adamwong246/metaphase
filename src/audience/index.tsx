import ReactDom from "react-dom/client";
import React, { useState } from "react";
import geckos from '@geckos.io/client'

import { udpPort } from "../index";
const channel = geckos({ port: udpPort });
const AudienceApp = (props) => {



  return <>
    <h3>audience</h3>

  </>
};

document.addEventListener("DOMContentLoaded", function () {


  channel.onConnect(error => {

    ReactDom.createRoot(
      document.getElementById('body-children')
    ).render(React.createElement(AudienceApp));

    if (error) {
      console.error(error.message)
      return
    }

    channel.on('base64Canvas', (packet) => {
      console.log(packet)
    });

    // channel.emit('helloFromAudience', window.udpRoomUid);
  });

});


