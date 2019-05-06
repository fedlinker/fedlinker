import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Styles from './pages/Styles';

const App = () => (
  <Router>
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/styles/">Styles</Link>
      </nav>

      <Route path="/" exact component={Home} />
      <Route path="/styles/" component={Styles} />
    </div>
  </Router>
);

ReactDOM.render(<App />, document.getElementById('root'));
