import React, {Component} from "react";
import './App.css';
import PlayerList from "./PlayerList";
import EndWeek from "./endWeek";
import EndDay from "./endDay";
import { Route, Switch} from "react-router-dom";


class App extends Component {

  render() {
    return (
      <React.StrictMode>
        <h1>Leaderboard</h1>
        <Switch>
          <Route exact path="/users/endOfTheDay" component={EndDay}/>
          <Route exact path="/users/endOfTheWeek" component={EndWeek}/>
          <Route path="/users/:id" component={PlayerList}/>
        </Switch>
      </React.StrictMode>
    );
  }
}

export default App;
