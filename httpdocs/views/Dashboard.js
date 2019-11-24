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
            <div>
                <Header user={this.props.user} updateUser={this.props.updateUser} />
                <p>dashboard</p>
            </div>
        );
    }
}

export default Dashboard;