import React, {Component} from "react";
import DataService from "./service";
import {Link} from "react-router-dom";


class EndDay extends Component {

  constructor(props) {
    super(props);
    this.getDay = this.getDay.bind(this);

    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this.getDay(this.props.match.params);
  }

  getDay() {
    DataService.getDay().then(response => {
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
        <div>Day ended. Please insert an id</div>
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

export default EndDay;