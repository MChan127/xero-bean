import React, {Component} from "react";
import ReactDOM from "react-dom";
import {Link} from "react-router-dom";

import {axiosPost} from "../util/global.js";

const Header = ({user, updateUser}) => {
    function logout() {
        axiosPost(API_URL + 'logout.php', {}, (res, errorHandler) => {
            if (!res.data) {
                errorHandler("Error: could not log out");
                return;
            }
            updateUser(null);
        });
    }
    
    return (
        <div className="header">
            <div className="logout">
                <a href="#" onClick={logout.bind(this)}>Log Out</a>
            </div>
            <div className="user-info">
                <p>Hi {user.username}!</p>
            </div>
            <div className="nav">
                <ul>
                    <li><Link to={"/"}>Dashboard</Link></li>
                    <li><Link to={"/accounts"}>Accounts</Link></li>
                    <li><Link to={"/vendors"}>Vendors</Link></li>
                </ul>
            </div>
        </div>
    );
};
export default Header;