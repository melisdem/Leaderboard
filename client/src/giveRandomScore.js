import React, {Component} from "react";
import DataService from "./service";
import {Link} from "react-router-dom";


class giveRandom extends Component {

  constructor(props) {
    super(props);
    this.getRandom = this.getRandom.bind(this);

    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this.getRandom(this.props.match.params);
  }

  getRandom() {
    DataService.getRandom().then(response => {
      this.setState({
        data:response.data
      })
      console.log(response.data)
    }).catch(e => {
      console.log(e)
    })
  }

  render() {
    let players = this.state.data;
    return(
      <div>
        <div>Hello from giverandom score</div>
          <div>You can choose from the below list</div>
          <ol>
            <li><Link to={{pathname: `${players[0]}`,state: {fromNotifications: true}}}>{players[0]}</Link></li>
            <li><Link to={{pathname: `${players[1]}`,state: {fromNotifications: true}}}>{players[1]}</Link></li>
            <li><Link to={{pathname: `${players[2]}`,state: {fromNotifications: true}}}>{players[2]}</Link></li>
            <li><Link to={{pathname: `${players[3]}`,state: {fromNotifications: true}}}>{players[3]}</Link></li>
          </ol>      
      </div>
    )
  }
}

export default giveRandom;