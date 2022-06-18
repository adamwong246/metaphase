import React, { useState } from "react";

import Regsiter from "./Regsiter";
import Login from "./Login";
import { IUser } from "../types";

export default (props: {users: IUser[]}) => {
  return (<>

    <h3>admins only</h3>

    <ul>
      {
        props.users.map((user) => {
          return (<li>{user.username}</li>)
        })
      }
    </ul>
  </>);
};