import React, {Component} from "react";
import DataService from "./service";

import {AgGridColumn, AgGridReact} from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const createImageArrow = (dailyDiff) => {
  const resultElement = document.createElement('span');
  const text = document.createTextNode(dailyDiff);
  const imageElement = document.createElement('img');
  if (dailyDiff > 0) {
    imageElement.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAABEklEQVRIie3XsUoDQRDG8f+aRC6x0UKLNHmCDYiCaGfhqwgWKQSLlJYphODbqGCdJgjmsBYtAhaCNnqe7I2NAQ2Xc3fJIeJ+3Q4784PZauFPRlC+rV6N7eujNd7NOdAwZHs3m6f3pcPrV51Vk1UvAf1ZusNUdkdbJ7elwTnoJM64NVyAeuFWsAXqjP8IO6BOeCHsgVrjCzNbBWWy6oUHCtCiYs42hvs1d3gOSerNmRstfmNB6bi7/K0hfRsD0fTVGtJMF6Nkco519Iw6zvzgnLSHhy9Afbq+lNIY7PRfbeeUuuoABzjAAQ7wv4NlnFN8HGz3k5z6/GAROsDDV1RQByjEZY73F0SPuisAse49uaK/mg9p52tzmAzd3wAAAABJRU5ErkJggg==";
  } else if (dailyDiff < 0 ) {
    imageElement.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAABL0lEQVRIie3WMUoDQRTG8f+Li4iVBhJMioC1BGwslE1hEwhrY5FD5BaewcbOA2i5CDZCkLW2EDtBEsQEBFEIYTHEZ6FCwOw6MxgU3K+bNzPvx0wzA78Ucd3YCfxlgMpJ9CSgM4d7QS1A9BAofpQeEW2Vwosjmz45WxjR/QkUII/KgVoewh6G0pRa/q65uTBr+EeSwRmcwRmcwX8fTn3KFKQb+EuTtXnhHvjyEnkjKQ89jT/HlY3oWfZ4dYL7O/6lwnramuTITTyYq6622/G02cSrVhCFsRv6nmHhIfHEibCAMpYGwpWD2RGR+trx9UtK//T0GrUCnp6hVM3R3PZKeH6btsjon2SBG6HGsCFujFrB3+BWqDWcgFujTjBAf3erqCM5BVlUoV4Oo65Ln/+VN5X+Y/1iyPygAAAAAElFTkSuQmCC";
  }
  resultElement.appendChild(imageElement);
  resultElement.appendChild(text);
  return resultElement;
};

const dailyDiffCellRenderer = params => {
  const dailyDiff = params.value;
  return createImageArrow(dailyDiff);
};

export default class PlayerList extends Component {

  constructor(props) {
    super(props);
    this.getUser = this.getUser.bind(this);

    this.state = {
      columnDefs: [
        { field: 'isMe',
          hide:true
        },
        { field: 'rank',
          pinned: 'left',
          width: 69,
          resizable:true,
          suppressSizeToFit: true
        },
        {
          field: 'country',
          width:90,
          maxWidth:100,
          resizable:true

        },
        { field: 'id',
          resizable:true
        },
        { field: 'username' },
        { field: 'score',
          maxWidth:70
        },
        { field: 'dailyDiff',
          maxWidth:100,
          minWidth:50,
          cellRenderer: "dailyDiffCellRenderer",
          cellStyle: params => {
            if (params.value === 0) {
              return {color: 'yellow'};
            } else if (params.value > 0) {
              return {color:"green"}
            } else {
              return {color:"red"}
            }
            return null;
          }
        },
        { field: 'money',
          maxWidth: 90
        }
      ],
      defaultColDef: {
        flex:1
      },
      components: {
      dailyDiffCellRenderer: dailyDiffCellRenderer
      },
      rowClassRules: {
        'me-style': function(params) {
          return params.data.isMe === true
        }
      },
      Users: []
    };
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
    return(
      <div id="my-grid" className="ag-theme-alpine" style={{ width: '100%', height: '100%' }}>
         <AgGridReact
            columnDefs={this.state.columnDefs}
            rowClassRules={this.state.rowClassRules}
            defaultColDef={this.state.defaultColDef}
            onGridReady={this.onGridReady}
            rowData={Players}
            components={this.state.components}
          />
      </div>
    )
  }
}

