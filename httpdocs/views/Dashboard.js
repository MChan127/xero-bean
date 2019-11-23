import React, {Component} from "react";
import ReactDOM from "react-dom";

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            user: props.user
        };
    }

    render() {
        return (
            <div>
                <p>{JSON.stringify(user)}</p>
                <p>dashboard</p>
            </div>
        );
    }
}

export default Dashboard;