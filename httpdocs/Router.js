import React from "react";
import {Switch, Route} from "react-router-dom";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";

const Router = ({user}) => {
    return (
        <Switch>
            <Route exact path={"/"} component={() => {
                if (!(user && user.auth === true)) {
                    return (
                        <Login />
                    );
                } else {
                    return (
                        <Dashboard user={user} />
                    );
                }
            }}/>
        </Switch>
    );
};
export default Router;