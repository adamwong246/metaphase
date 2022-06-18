import React, { useState } from "react";

import Regsiter from "./Regsiter";
import Login from "./Login";

export default (props) => {
  return (<>

    <h3>Welcome to spacetrash</h3>
    <p>a game about robots fighting in space</p>

    {
      props.isAuthenticated && <>
        <p>under construction</p>

      </>
    }

    {
      !props.isAuthenticated && <>
        <Regsiter />
        <Login />
      </>
    }
  </>);
};