import React, { Component } from 'react';
import logo from './images/mera_dot_ki2_515.png';
import './App.css';

import fetch from 'isomorphic-fetch'

class App extends Component {

  constructor (props) {
    super(props)
    this.state = {
      shortURL: null,
      longURL: null,
      isLoading: false,
      lastError: null,
    }
  }

  async tryCreateNewLink () {
    try {
      this.setState({ isLoading: true })
      this.setState({ longURL: null, shortURL: null })
      const longURL = this.input.value
      const response = await fetch('/api/shorten', {
        body: { longURL },
        method: 'POST',
      })
      if (response.status !== 200) {
        throw new Error(response.status)
      }
      const { shortURL } = await response.body()
      this.setState({ longURL, shortURL })
    } catch (error) {
      console.error(error)
      this.setState({ lastError: error })
    } finally {
      this.setState({ isLoading: false })
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {/*
          <h1 className="App-title">Welcome to Mera.ki</h1>
          */}
        </header>
        <div className="App-intro">
          Enter the URL you would like to shorten: &nbsp;
          <form action="#" onSubmit={() => this.tryCreateNewLink()}>
            <input disabled={this.state.isLoading} ref={element => this.input = element} type="text" />
            <input type="submit" value="Shorten" />
          </form>
        </div>
      </div>
    );
  }
}

export default App;
