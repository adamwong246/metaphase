import React, { useState } from "react";

export default () => {
  return (<>
    <form action="/auth/register" method="post">
      <p><label>Username: <input type="text" name="username" /></label></p>
      <p><label>Password: <input type="password" name="password" /></label></p>
      <p><button type="submit">Register</button></p>
    </form>
  </>);
};