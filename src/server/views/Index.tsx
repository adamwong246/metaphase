import React, { useState } from "react";

import { IInjections } from "../types";

import Regsiter from "./Regsiter";
import Login from "./Login";

export default (props: {
  children: any,
  injections: IInjections[],
  isAuthenticated: boolean, isAdmin: boolean, username: string
}) => {
  return (<>
    <html>
      <head>
        <title>spacetrash</title>

        {
          ...props.injections.map((i) => {
            const p = {};
            if (i.src) {
              p.src = i.src;
            };

            return (<script {...p} dangerouslySetInnerHTML={{ __html: i.content }} />);
          })
        }

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

        <div id="body-children">
          {props.children}
        </div>
      </body>
    </html>
  </>);
};