import React, { useState } from "react";

import { IUser, IGameSession } from "../types";

export default (props: { gameSessions: IGameSession[], users: IUser[] }) => {
  return (<>

    <h3>admins only</h3>

    <ul>
      {
        props.users.map((user) => {
          return (<li>{user.username}</li>)
        })
      }
    </ul>

    <ul>
      {
        props.gameSessions.map((gs) => {
          return (<li>
            {JSON.stringify(gs)}
            <a href={`/play/${gs.uid}`}>{`/play/${gs.uid}`}</a>
          </li>)
        })
      }
    </ul>

    <form action="/gameSession" method="post">
      <p><button type="submit">New game session</button></p>
    </form>

  </>);
};