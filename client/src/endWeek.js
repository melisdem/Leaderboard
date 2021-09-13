import React, {Component} from "react";
import DataService from "./service";

class EndWeek extends Component {

  constructor(props) {
    super(props);
    this.getWeek = this.getWeek.bind(this);

    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this.getWeek(this.props.match.params);
  }

  getWeek() {
    DataService.getWeek().then(response => {
      this.setState({
        data:response.data
      })
      console.log(response.data)
    }).catch(e => {
      console.log(e)
    })
  }

  render() {
    return(
      <React.StrictMode>
        <div>Hello from endweek</div>
      </React.StrictMode>
    )
  }
}
export default EndWeek;