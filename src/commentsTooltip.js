import React, { Component } from 'react';
import './App.css';
import DOMPurify from 'dompurify';

class App extends Component {  
  constructor(props) {
    super(props);
    this.state = {
      currentBaseOffset: null,
      currentExtentOffset: null,
      currentSiblingsId: null,
      documentTitle: this.props.data.title,
      documentText: this.props.data.text,
      selectedText: '',
      showTooltip: false,
      showCommentForm: false,
      tooltipX: null,
      tooltipY: null,
      comments: [
        {
          id: 1,
          text: 'A default comment',
          baseOffset: 58,
          extentOffset: 100
        }
      ]
    };

    window.addEventListener('mouseup', this.getSelectedText.bind(this), true);
    window.addEventListener('mousedown', this.handleClickEvent.bind(this));

  }

  toggleCommentForm(e) {
    e.preventDefault();
    this.setState({
      showCommentForm: !this.state.showCommentForm
    })
  }

  hideTooltip(e) {
    e.preventDefault();
    this.setState({
      showTooltip: false    
    })
  }

  addCommentForm(e) {
    e.preventDefault();

    let comments = this.state.comments;
    let newId = comments.length > 0 ? (comments[comments.length - 1].id) + 1 : 0;

    const newComment = {
      id: newId,
      text: DOMPurify.sanitize(this.refs.commentText.value),
      baseOffset: this.state.currentBaseOffset,
      extentOffset: this.state.currentExtentOffset
    }

    this.setState({
      currentBaseOffset: null,
      currentExtentOffset: null,
      comments: [...this.state.comments, newComment]
    });

    this.refs.commentForm.reset();
  }

  deleteComment(ev) {
    ev.preventDefault();
    let commentId = ev.target.getAttribute('data-comment-id');
    let index;
    for (let i in this.state.comments) {
        if (this.state.comments[i].id == commentId) {
          index = parseInt(i);
        };
    }

    let newComments = [...this.state.comments.slice(0, index), ...this.state.comments.slice(index + 1)];

    this.setState({
      comments: newComments
    });
  }

  handleClickEvent(ev) {
    let selText = window.getSelection();
    let checkSelecLength = selText.extentOffset - selText.baseOffset;

    if (checkSelecLength === 0 && ev.target.className !== 'tooltip-comments-form-textarea') {
        this.setState({
          showTooltip: false,
          showCommentForm: false,
        })
    }

    this.props.selectText(ev, this.state.comments);
  }

  getSelectedText(e) {
      if (e.target.className === 'text-container' || e.target.parentNode.className === 'text-container') {
        let muText = window.getSelection();
        let selectedText = muText.toString();
        let checkSelecLength = muText.extentOffset - muText.baseOffset;

        /* Check if other span tags have been already injected into the text */
        if (checkSelecLength > 0) {
          let siblingsId = [];
          const recursiveSibling = (obj) => {
              if (obj.previousElementSibling) {
                siblingsId.push(obj.previousElementSibling.id);
                recursiveSibling(obj.previousElementSibling);
              } else {
                this.setState({
                  currentSiblingsId: siblingsId
                })
              }
          }
          
          recursiveSibling(muText.baseNode);

          let muTextRange = muText.getRangeAt(0);
          let muTextRect = muTextRange.getClientRects();
          let tooltipYPos = (muTextRect[0].top) - 35;
          let tooltipXPos = muTextRect[0].left;

          this.setState({
            currentBaseOffset: muText.baseOffset,
            currentExtentOffset: muText.extentOffset,
            showTooltip: true,
            selectedText: selectedText,
            tooltipX: tooltipYPos,
            tooltipY: tooltipXPos
          })

          document.body.style.setProperty('--tooltip-top-pos', `${tooltipYPos}px`);
          document.body.style.setProperty('--tooltip-left-pos', `${tooltipXPos}px`);
            
        } else {
          this.setState({
            showTooltip: false
          })
        }

        if (!muText) {
          this.setState({
            showTooltip: false
          })
        }
        
      }
  }

  render() {
    const renderComments = () => {
      if (this.state.comments) {
        let comments = this.state.comments;
        return (
          Object.keys(comments).map( (i) => {
            return (
              <div key={i} id={`comment-${comments[i].id}`} className="comment"> 
                <div className="comment-text">
                  {comments[i].text} 
                </div>
                <button className="comment-delete" data-comment-id={comments[i].id} onClick={this.deleteComment.bind(this)}>Delete</button>
              </div> 
              );
          })
        )
      }
    }

    let tooltipDisplayClass = this.state.showTooltip ? 'show' : 'hide';
    let commentFormDisplayClass = this.state.showCommentForm ? 'show' : 'hide';

    return (
      <div>
        <div className="tooltip-container">
          <div className={`tooltip ${tooltipDisplayClass}`}>
            <button className="toggle-form" onClick={this.toggleCommentForm.bind(this)}><span role="img" aria-label="comment">💬</span></button>
            <button className="tooltip-close" onClick={this.hideTooltip.bind(this)}>✕</button>
          </div>
          <div className={`tooltip-comments-form ${commentFormDisplayClass}`}>
            <form ref="commentForm" onSubmit={this.addCommentForm.bind(this)}>
              <input ref="commentText" className="tooltip-comments-form"/>
              <button type="submit" hidden></button>
            </form>
          </div>
        </div>
        
        <div className="comments-container">
          { renderComments() }
        </div>
      </div>
    );
  }
}

export default App;