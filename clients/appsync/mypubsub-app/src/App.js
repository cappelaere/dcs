import logo from './logo.svg';
import './App.css';
import React from 'react';
import { newGrb } from './graphql/subscriptions'
const { API } = require('@aws-amplify/api')
const config = require('./aws-exports')

// after your imports
console.log("API configure...")
API.configure(config)

async function subscribeGrb() {
  let cid, dsn, instrument, level, mode, satellite
  console.log("Subscribed to Grb...")
  const response = await API.graphql({
    query: newGrb,
    variables: {
      cid, dsn, instrument, level, mode, satellite
    },
  })
  console.log('subscribeGrb', response)
}
console.log("App...")

async function App() {
  console.log("App..")
  await subscribeGrb()

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Pat, Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
