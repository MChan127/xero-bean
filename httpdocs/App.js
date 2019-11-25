import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, HashRouter} from "react-router-dom";
import {Link} from "react-router-dom";

import './assets/app.scss';

import Router from "./Router";

/**
 * Initializes the React app.
 */
class App extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            ...this.state,
            user: authUser,
        };
    }

    updateUser(user) {
        if (user === null) {
            // logging out, so redirect
            window.location.replace('/');
            return;
        }
        this.setState({user});
    }

    render() {
        return (
            <div>
                <Router user={this.state.user} updateUser={this.updateUser.bind(this)} />
            </div>
        );
    }
}

ReactDOM.render(<HashRouter><App /></HashRouter>, document.getElementById('app'));
