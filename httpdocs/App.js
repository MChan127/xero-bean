import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from "react-router-dom";
import {Link} from "react-router-dom";

import './assets/app.css';

import Router from "./Router";

class App extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            ...this.state,
            user: authUser,
        };
    }

    render() {
        return (
            <div>
                <Router user={this.state.user} />
                
                home
            </div>
        );
    }
}

ReactDOM.render(<BrowserRouter basename="/bean"><App /></BrowserRouter>, document.getElementById('app'));
