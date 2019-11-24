import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from "react-router-dom";
import {Link} from "react-router-dom";

import './assets/app.scss';

import Router from "./Router";

class App extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            ...this.state,
            user: authUser,
        };
    }

    updateUser(user) {
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

ReactDOM.render(<BrowserRouter basename="/bean"><App /></BrowserRouter>, document.getElementById('app'));
