import 'fetch';
import $ from 'jquery';
import Remarkable from 'remarkable';
import React from 'react';
import ReactDOM from 'react-dom';

class Comment extends React.Component {
  rawMarkup() {
    var md = new Remarkable();
    var rawMarkup = md.render(this.props.children.toString());
    return { __html: rawMarkup };
  }

  render() {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
}

class CommentList extends React.Component {
  render() {
    var commentNodes = this.props.data.map(function (comment) {
      return (
        <Comment author={comment.author} key={comment.id}>
          {comment.text}
        </Comment>
      );
    });

    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
}

class CommentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      author: '',
      text: ''
    };

    this.handleAuthorChange = (e) => {
      this.setState({author: e.target.value});
    };

    this.handleTextChange = (e) => {
      this.setState({text: e.target.value});
    };

    this.handleSubmit = (e) => {
      e.preventDefault();
      var author = this.state.author.trim();
      var text = this.state.text.trim();
      if (!text || !author)
        return;

      this.props.onCommentSubmit({author: author, text: text});
      this.setState({author: '', text: ''});
    };
  }

  render() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={this.state.author}
          onChange={this.handleAuthorChange.bind(this)}
        />
        <br />
        <input
          type="text"
          placeholder="Say something..."
          value={this.state.text}
          onChange={this.handleTextChange.bind(this)}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
}

class CommentBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    this.loadCommentsFromServer();
    // setInterval(this.loadCommentsFromServer.bind(this), this.props.pollInterval.bind);
  }

  loadCommentsFromServer() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: (data) => this.setState({data: data}),
      error: (xhr, status, err) => console.error(this.props.url, status, err.toString())
    });
  }

  handleCommentSubmit(comment) {
    var comments = this.state.data;
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: (data) => this.setState({data: data}),
      error: (xhr, status, err) => {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }
    });
  }

  render() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit.bind(this)} />
      </div>
    );
  }
}

ReactDOM.render(<CommentBox url="/api/comments.json" pollInterval={2000} />,
  document.getElementById('content')
);