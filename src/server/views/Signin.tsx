import React, { useState } from "react";

export default () => {
  return (<>
    <h1>Register</h1>
    <form action="/auth/register" method="post">
      <p><label>Username: <input type="text" name="username" /></label></p>
      <p><label>Password: <input type="password" name="password" /></label></p>
      <p><button type="submit">Register</button></p>
    </form>
  </>);
};