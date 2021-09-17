import React, {Component} from "react";
import './App.css';
import PlayerList from "./PlayerList";
import EndWeek from "./endWeek";
import EndDay from "./endDay";
import giveRandomScore from "./giveRandomScore";
import { Route, Switch, NavLink, Redirect} from "react-router-dom";

class App extends Component {

  render() {
    return (
      <div className="wrapper">
        <ul className="nav-links">
          <NavLink to="/users/endOfTheDay" exact={true}><li><button>Click for End of the Day</button></li></NavLink>
          <NavLink to="/users/endOfTheWeek" exact={true}><li><button>Click for End of the Week</button></li></NavLink>
          <NavLink to="/users/giveRandomScore" exact={true}><li><button>Click for Random Score</button></li></NavLink>
        </ul>
        <h1>Leaderboard</h1>
        <Switch>
          <Route exact path="/"><Redirect to="/users/endOfTheDay"/></Route>
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
