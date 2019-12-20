import React from 'react';

import Login from './login';
import Profile from './profile';
import Upload from './upload';
import Feed from './feed';
import Signup from './signup';
import FastStyle from './fastStyle';

import { Route} from 'react-router-dom'; 

function App() {
  return (
    <div className="App">
      <Route exact path="/" component = {Feed}  />
      <Route path="/login" component = {Login}  />
      <Route path="/signup" component = {Signup}  />
      <Route path="/profile" component = {Profile}  />
      <Route path="/upload" component = {Upload}  />
      <Route path="/fastStyle" component = {FastStyle} />
    </div>
  );
}

export default App;
