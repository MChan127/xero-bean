import React, {useEffect} from "react";
import {Switch, Route} from "react-router-dom";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import Accounts from "./views/Accounts";
import Vendors from "./views/Vendors";

const Router = ({user, updateUser}) => {
    useEffect(() => {
        // console.log('props', user);
    }, [user]);
    
    if (!user) {
        return (
            <Switch>
                <Route exact path={"/"} component={() => {
                    return (<Login updateUser={updateUser} />);
                }} />
            </Switch>
        );
    } else {
        return (
            <Switch>
                <Route exact path={"/"} component={() => {
                    return (<Dashboard user={user} updateUser={updateUser} />);
                }} />
                <Route exact path={"/accounts"} component={() => {
                    return (<Accounts user={user} updateUser={updateUser} />);
                }} />
                <Route exact path={"/vendors"} component={() => {
                    return (<Vendors user={user} updateUser={updateUser} />);
                }} />
            </Switch>
        );
    }
};
export default Router;