import React, { useState } from "react";

import { IUser, IGameSession } from "../types";

export default (props: { gameSessions: [], users: IUser[] }) => {
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
            <p><a href={`/play/${gs}`}>{`/play/${gs}`}</a></p>
            <p><a href={`/watch/${gs}`}>{`/watch/${gs}`}</a></p>
          </li>)
        })
      }
    </ul>

    <form action="/gameSession" method="post">
      <p><button type="submit">New game session</button></p>
    </form>

  </>);
};