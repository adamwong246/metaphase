import React, { useState } from "react";

export default () => {
  return (<>
    <h1>Status</h1>
    <p>You are authenticated.</p>
    <p><a href="/auth/logout">Logout</a>?</p>
  </>);
};