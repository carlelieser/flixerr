import React, { Component } from 'react'

import Fade from 'react-reveal/Fade'
import TextareaAutosize from 'react-textarea-autosize'

let moment = require('moment')
let usernameGenerator = require('username-generator')
let randomColor = require('randomcolor')

class MovieChat extends Component {
    constructor(props) {
        super(props)

        this.chatListRef = React.createRef()

        this.state = {
            currentMessage: '',
            chatUsername: '',
            chatProfileColor: '#FFF',
        }
    }

    initializeChatData = () => {
        let username = usernameGenerator.generateUsername()
        let color = randomColor()

        this.setState({ chatUsername: username, chatProfileColor: color })
    }

    setCurrentMessage = (currentMessage) => {
        this.setState({ currentMessage })
    }

    resetMessage = () => {
        this.setCurrentMessage('')
    }

    handleTextareaChange = (e) => {
        let value = e.currentTarget.value
        this.setCurrentMessage(value)
    }

    handleSendMessage = () => {
        let movie = this.props.movie
        let id = (movie.id || movie.rg_id).toString()
        this.props.sendMovieMessage(
            id,
            this.state.currentMessage,
            this.state.chatUsername,
            this.state.chatProfileColor
        )
        this.resetMessage()
    }

    getReadableDate = (time) => {
        return moment(time).fromNow()
    }

    adjustChatScroll = () => {
        this.chatListRef.current.scrollTop = this.chatListRef.current.scrollHeight
    }

    handleKeyUp = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault()
            if (e.shiftKey) {
                this.setState((prevState) => {
                    let message = prevState.currentMessage
                    let newMessage = message + '\n'
                    return {
                        currentMessage: newMessage,
                    }
                })
            } else {
                this.handleSendMessage()
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.messages !== this.props.messages) {
            this.adjustChatScroll()
        }
    }

    componentDidMount() {
        this.initializeChatData()
    }

    render() {
        let movieChats = this.props.messages
            ? this.props.messages.map((message, index) => (
                  <Fade distance="5%" bottom>
                      <div
                          className="message"
                          key={message.id}
                          style={{ marginTop: index === 0 ? 'auto' : '0.5em' }}
                      >
                          <div
                              className="profile-photo"
                              style={{ backgroundColor: message.color }}
                          >
                              {message.alias.substring(0, 1)}
                          </div>
                          <div className="message-content">
                              <span>
                                  <div
                                      className="alias"
                                      style={{
                                          color:
                                              message.from === this.props.email
                                                  ? '#a58cff'
                                                  : '#FFF',
                                      }}
                                  >
                                      {message.alias}
                                  </div>
                                  <div className="date">
                                      {this.getReadableDate(message.createdOn)}
                                  </div>
                              </span>
                              <div className="text">{message.text}</div>
                          </div>
                      </div>
                  </Fade>
              ))
            : null
        return (
            <div className="movie-chat-container">
                <span className="movie-chat-header">
                    <div className="title">Chat</div>
                    <span className="audience-count">
                        <span>Watching</span>
                        <Fade spy={this.props.currentAudienceCount}>
                            <span>{this.props.currentAudienceCount}</span>
                        </Fade>
                    </span>
                </span>
                <div className="chat-list" ref={this.chatListRef}>
                    {movieChats}
                </div>
                <div className="message-input-container">
                    <TextareaAutosize
                        placeholder="Say something here..."
                        value={this.state.currentMessage}
                        onChange={this.handleTextareaChange}
                        onKeyDown={this.handleKeyUp}
                        autoFocus
                    />
                    <div
                        className="message-send-btn"
                        onClick={this.handleSendMessage}
                    >
                        <i className="mdi mdi-send" />
                    </div>
                </div>
            </div>
        )
    }
}

export default MovieChat
