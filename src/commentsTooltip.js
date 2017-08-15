import React, { Component } from 'react';
import './App.css';
import DOMPurify from 'dompurify';

class CommentsTooltip extends Component {  
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
          text: 'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?',
          userName: 'TestUser',
          timestamp: 1502825033,
          baseOffset: 58,
          extentOffset: 100
        }
      ]
    };

    var ts = Math.round(new Date().getTime() / 1000);
    console.log(ts);

    window.addEventListener('mouseup', this.getSelectedText.bind(this), true);
    window.addEventListener('mousedown', this.handleMouseDownEvent.bind(this));
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
    let ts = Math.round(new Date().getTime() / 1000);

    const newComment = {
      id: newId,
      userName: 'TestUser',
      text: DOMPurify.sanitize(this.refs.commentText.value),
      timestamp: ts,
      baseOffset: this.state.currentBaseOffset,
      extentOffset: this.state.currentExtentOffset
    }

    this.setState({
      currentBaseOffset: null,
      currentExtentOffset: null,
      comments: [...this.state.comments, newComment],
      showTooltip: false,
      showCommentForm: false
    });

    this.refs.commentForm.reset();
  }

  deleteComment(ev) {
    console.log(ev.target.getAttribute('data-comment-id'));
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
    this.props.hideSelectedText();
  }

  showSelection(ev) {
    let elementClass = ev.target.className;
    if (elementClass === 'comment') {
      this.props.showSelectedText(ev, this.state.comments);
    }
  }

  hideSelection(ev) {
    let elementClass = ev.target.className;
    if (elementClass === 'comment') {
      this.props.hideSelectedText();
    }
  }

  handleMouseDownEvent(ev) {
    let selText = window.getSelection();
    let checkSelecLength = selText.extentOffset - selText.baseOffset;

    if (checkSelecLength === 0 && ev.target.className !== 'tooltip-comments-form-textarea') {
        this.setState({
          showTooltip: false,
          showCommentForm: false,
        })
    }
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
              <div 
                key={i} 
                id={`comment-${comments[i].id}`} 
                className="comment" 
                onMouseEnter={this.showSelection.bind(this)}
                onMouseLeave={this.hideSelection.bind(this)}
              > 
                <div className="comment-details">
                  <small>
                    From: <span className="username">{comments[i].userName}</span>
                    <a href="#/" className="comment-delete" data-comment-id={comments[i].id} onClick={this.deleteComment.bind(this)}>Delete</a>
                  </small>
                </div>
                <div className="comment-text">
                  {comments[i].text} 
                </div>
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
        <div className="tooltip-container" style={{top: this.state.tooltipX, left: this.state.tooltipY}}>
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

export default CommentsTooltip;
