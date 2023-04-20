import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { newGrb } from './graphql/subscriptions'
const { API } = require('@aws-amplify/api')
const config = require('./aws-exports')

// after your imports
API.configure(config)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// async function subscribeDcs() {
//   let cid, agency, platformId, sat
//   const response = await API.graphql({
//     query: newDcp,
//     variables: {
//       cid,
//       agency,
//       platformId,
//       sat
//     },
//   })
//   console.log('subscribeDcs', response)
// }

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

const start = async () => {
  console.log("Started...")
  await subscribeGrb()
}

start()
