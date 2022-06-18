import React, { useState } from "react";

export default () => {
  return (<>
    <form action="/auth/login" method="post">
      <p><label>Username: <input type="text" name="username" /></label></p>
      <p><label>Password: <input type="password" name="password" /></label></p>
      <p><button type="submit">Log In</button></p>
    </form>
  </>);
};