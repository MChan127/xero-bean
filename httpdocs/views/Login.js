import React, {Component} from "react";
import ReactDOM from "react-dom";

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
        };
    }

    render() {
        return (
            <div class="page--login container">
                <div class="row">
                    <div class="login col-md-4 col-offset-md-4">
                        Login
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;