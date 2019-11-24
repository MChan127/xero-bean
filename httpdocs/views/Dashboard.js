import React, {Component} from "react";
import ReactDOM from "react-dom";

import {axiosPost} from "../util/global.js";

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            user: props.user
        };
    }
    
    logout() {
        axiosPost(API_URL + 'logout.php', {}, (res, errorHandler) => {
            if (!res.data) {
                errorHandler("Error: could not log out");
                return;
            }
            this.props.updateUser(null);
        });
    }

    render() {
        return (
            <div>
                <a href="#" onClick={this.logout.bind(this)}>Log Out</a>
                <p>{JSON.stringify(this.state.user)}</p>
                <p>dashboard</p>
            </div>
        );
    }
}

export default Dashboard;