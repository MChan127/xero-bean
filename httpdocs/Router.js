import React, {useEffect} from "react";
import {Switch, Route} from "react-router-dom";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";

const Router = ({user, updateUser}) => {
    useEffect(() => {
        // console.log('props', user);
    }, [user]);
    
    return (
        <Switch>
            <Route exact path={"/"} component={() => {            
                if (!user) {                
                    return (
                        <Login updateUser={updateUser} />
                    );
                } else {                
                    return (
                        <Dashboard user={user} updateUser={updateUser} />
                    );
                }
            }}/>
        </Switch>
    );
};
export default Router;