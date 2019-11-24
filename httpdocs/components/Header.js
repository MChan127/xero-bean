import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTachometerAlt, faPiggyBank, faBuilding, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

import { axiosPost } from "../util/global.js";

const Header = ({ user, updateUser }) => {
    function logout() {
        if (confirm("Are you sure you want to log out?")) {
            axiosPost(API_URL + 'logout.php', {}, (res, errorHandler) => {
                if (!res.data) {
                    errorHandler("Error: could not log out");
                    return;
                }
                updateUser(null);
            });
        }
    }

    return (
        <div className="header container-fluid">
            <div className="row">
                <div className="user-info col-md-2">
                    <p>Hi {user.username}!</p>
                </div>
                <div className="nav col-md-10">
                    <ul>
                        <li><Link to={"/"}><span>Dashboard <FontAwesomeIcon icon={faTachometerAlt} /></span></Link></li>
                        <li><Link to={"/accounts"}><span>Accounts <FontAwesomeIcon icon={faPiggyBank} /></span></Link></li>
                        <li><Link to={"/vendors"}><span>Vendors <FontAwesomeIcon icon={faBuilding} /></span></Link></li>
                        <li><a href="#" onClick={logout.bind(this)}><span>Log Out <FontAwesomeIcon icon={faSignOutAlt} /></span></a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
export default Header;