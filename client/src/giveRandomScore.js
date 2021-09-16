import React, {Component} from "react";
import DataService from "./service";

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
    return(
      <div>Hello from giverandom score</div>
    )
  }
}

export default giveRandom;