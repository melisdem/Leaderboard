import React, {Component} from "react";
import DataService from "./service";

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
    return(
      <div>Hello from endDay</div>
    )
  }
}

export default EndDay;