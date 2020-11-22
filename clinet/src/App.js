import React from "react";
import { Switch, Route } from "react-router-dom";
import GetEvents from "./getEvents";

import Home from "./home";
function App() {
  return (
    <Switch>
      <Route path="/events" component={GetEvents}/>
      <Route path="/" component={Home} />
    </Switch>
  );
}

export default App;
