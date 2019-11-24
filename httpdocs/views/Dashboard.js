import React, {Component} from "react";
import ReactDOM from "react-dom";

import Header from "../components/Header";

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
        };
    }

    render() {
        return (
            <div className="page dashboard">
                <Header user={this.props.user} updateUser={this.props.updateUser} />
                <h1>Dashboard</h1>
                <p>Click on "Accounts" or "Vendors" to view their respective data. </p>
            </div>
        );
    }
}

export default Dashboard;