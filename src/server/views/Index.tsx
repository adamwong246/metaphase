import React, { useState } from "react";

import Regsiter from "./Regsiter";
import Login from "./Login";

export default (props) => {
  return (<>
    <html>
      <head>
        <title>spacetrash</title>
        <meta name="description" content="Our first page" />
        <meta name="keywords" content="html tutorial template" />
      </head>
      <body>
        <a href="/"><h1>spacetrash</h1></a>
        {
          props.isAuthenticated && <>
            <p>you are logged in as {props.username}. <a href="/auth/logout">logout</a></p>
          </>
        }

        {
          props.isAdmin && <>
            <p>you are <a href="/admin">admin</a> </p>
          </>
        }

        {
          !props.isAuthenticated && <>
            <Regsiter />
            <Login />
          </>
        }

        {props.children}
      </body>
    </html>
  </>);
};