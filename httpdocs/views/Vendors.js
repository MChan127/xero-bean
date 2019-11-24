import React, {Component} from "react";
import ReactDOM from "react-dom";

import {axiosGet} from "../util/global.js";

import Header from "../components/Header";
import JsonDataTable from "../components/JsonDataTable";

class Vendors extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            data: {}
        };
    }

    componentDidMount() {
        axiosGet(
            API_URL + "get_xero_data.php?type=vendors",
            (res, errorHandler) => {
                if (!res.data) {
                    errorHandler("Error: Could not fetch accounts");
                    return;
                }
                this.setState({
                    data: res.data.data
                });
            }
        );
    }

    render() {
        return (
            <div className="page vendors">
                <Header user={this.props.user} updateUser={this.props.updateUser} />
                <h1>Vendors</h1>
                {
                    this.state.data && Object.keys(this.state.data).length > 0 ? 
                    <JsonDataTable rawData={this.state.data} name="Vendors" /> :
                    <div className="loading-animation"><div className="lds-circle"><div></div></div></div>
                }
            </div>
        );
    }
}

export default Vendors;