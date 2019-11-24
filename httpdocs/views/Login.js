import React, {Component} from "react";
import ReactDOM from "react-dom";

import {axiosPost} from "../util/global.js";

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            username: '',
            password: '',
            remember: false
        };
    }

    login() {
        const username = this.state.username,
              password = this.state.password,
              remember = this.state.remember || this.state.remember == 'on' ? true : false;
              
        if (!(username && password)) {
            alert("You must provide a username and password");
            return;
        }

        let user = null;
        axiosPost(API_URL + "login.php", {username, password, remember}, (res, errHandler) => {
            if (res.data && res.data.user) {
                user = res.data.user;
                this.props.updateUser(user);
            } else {
                errHandler("Error login in, please contact our support team");
            }
        });
    }

    handleInputChange(type = 'text') {
        const that = this;
        return (event) => {
            const target = event.target;    

            let value;
            switch(type) {
                case 'checkbox':
                    value = target.checked;
                    break;
                default:
                    value = target.value;
            }

            that.setState({
                [target.name]: value
            });
        };
    }

    render() {
        return (
            <div className="page login container">
                <div className="row">
                    <div className="login-form col-md-6 offset-md-3">
                        <p>Welcome to Xero-Beanworks.<br/>
                        Please log in with your given username and password.</p>
                        
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" className="form-control" name="username" 
                                placeholder="Username" 
                                onChange={this.handleInputChange().bind(this)}
                                value={this.state.username}
                                required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" className="form-control" name="password" 
                                placeholder="Password" 
                                onChange={this.handleInputChange().bind(this)}
                                value={this.state.password}
                                required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="remember">Remember Me?</label>
                            <input type="checkbox" 
                                className="form-control" 
                                name="remember" 
                                onChange={this.handleInputChange('checkbox').bind(this)}
                                value={this.state.remember} />
                        </div>

                        <button className="btn btn-primary" onClick={this.login.bind(this)}>Log In</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;