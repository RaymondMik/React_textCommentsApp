import React, { Component } from 'react';
import './App.css';
import data from './data.js';
import Parser from 'html-react-parser';
import CommentsTooltip from './CommentsTooltip';

class App extends Component {  
  constructor() {
    super();
    this.state = {
      documentTitle: data.title,
      documentText: data.text,
    };

  }

  showSelectedText(ev, stateComments) {
      this.setState({
        documentText: data.text
      });

      let element = ev.target.id;
      let id = [...element][[...element].length - 1];
      let comments = stateComments;
      let text = this.state.documentText;
      let selectedText;

      for (let comment of comments) {
          if (parseInt(id, 9) === comment.id) {
            selectedText = text.substring(comment.baseOffset, comment.extentOffset);
            text = text.replace(selectedText, `<span id="${comment.id}" className="text-selection">${selectedText}</span>`);
          }
      }
  
      this.setState({
        documentText: text
      });
  }

  hideSelectedText() {
    this.setState({
      documentText: data.text
    })
  }

  render() {
    return (
      <div className="container">
        <div className="document-container">
          <h3 className="title">{ Parser(this.state.documentTitle) }</h3>
          <div className="text-container">
            { Parser(this.state.documentText) }
          </div>
        </div>
        <CommentsTooltip 
          data={data}
          showSelectedText={this.showSelectedText.bind(this)}
          hideSelectedText={this.hideSelectedText.bind(this)}
        />
      </div>
    );
  }
}

export default App;
