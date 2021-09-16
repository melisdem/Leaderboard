import React, {Component} from "react";
import './App.css';
import PlayerList from "./PlayerList";
import EndWeek from "./endWeek";
import EndDay from "./endDay";
import giveRandomScore from "./giveRandomScore";
import { Route, Switch, Link, NavLink} from "react-router-dom";

class App extends Component {

  render() {
    return (
      <div className="wrapper">
        <h1>Leaderboard</h1>
        <NavLink to='/users/61336eba354c3145fc9d917b' exact={true}>Home</NavLink>
        <NavLink to="/users/endOfTheDay" exact={true}>Click for End of the Day</NavLink>
        <NavLink to="/users/endOfTheWeek" exact={true}>Click for End of the Week</NavLink>
        <NavLink to="/users/giveRandomScore" exact={true}>Click for Random Score</NavLink>
        <Switch>
          <Route exact path="/users/endOfTheDay" component={EndDay}/>
          <Route exact path="/users/endOfTheWeek" component={EndWeek}/>
          <Route exact path="/users/giveRandomScore" component={giveRandomScore}/>
          <Route path="/users/:id" component={PlayerList}/>
        </Switch>
      </div>
    );
  }
}

export default App;
