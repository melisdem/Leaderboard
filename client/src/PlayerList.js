import React, {Component} from "react";
import DataService from "./service";

export default class PlayerList extends Component {

  constructor(props) {
    super(props);
    this.getUser = this.getUser.bind(this);

    this.state = {
      Users: []
    }
  }

  componentDidMount() {
    this.getUser(this.props.match.params.id);
  }

  getUser(id) {
    DataService.get(id).then(response => {
      this.setState({
        Users:response.data
      })
      console.log(response.data)
    }).catch(e => {
      console.log(e)
    })
  }


  render() {
    const Players = this.state.Users;
    const pricePool = Players.pop();
    const Playerslist = Players.map((player, i) => {
      return <li key={player.id}> {player.rank} {player.username} {player.country} {player.score} {player.money} {player.dailyDiff} </li>
    })
    return(
      <React.StrictMode>
        <ol>
          {Playerslist}
          {pricePool}
        </ol>
      </React.StrictMode>
    )
  }


}