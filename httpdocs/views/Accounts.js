import React, {Component} from "react";
import ReactDOM from "react-dom";

import {axiosGet} from "../util/global.js";

import Header from "../components/Header";
import JsonDataTable from "../components/JsonDataTable";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from '@fortawesome/free-solid-svg-icons';

class Accounts extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            data: {},
            columns: [],
        };
    }

    componentDidMount() {
        this.fetchXeroData().bind(this)();
    }

    fetchXeroData(refresh = false) {
        return function() {
            const that = this;

            if (this.state.data && Object.keys(this.state.data).length > 0) {
                this.setState({
                    data: {},
                    columns: []
                }, fetchData);
            } else {
                fetchData();
            }

            function fetchData() {
                axiosGet(
                    API_URL + "get_xero_data.php?type=accounts" + (refresh ? "&refresh=true" : ""),
                    (res, errorHandler) => {
                        if (!res.data) {
                            errorHandler("Error: Could not fetch accounts");
                            return;
                        }
                        that.setState({
                            data: res.data.data,
                            columns: res.data.columns,
                        });
                    }
                );
            }
        };
    }

    render() {
        return (
            <div className="page accounts">
                <Header user={this.props.user} updateUser={this.props.updateUser} />
                <h1>Accounts</h1>

                <div className="sync-xero-data" onClick={this.fetchXeroData(true).bind(this)}>
                    <FontAwesomeIcon icon={faSync} />
                </div>
                {
                    this.state.data && Object.keys(this.state.data).length > 0 ? 
                    <JsonDataTable data={this.state.data} columns={this.state.columns} refetch={this.fetchXeroData().bind(this)} name="Accounts" /> :
                    <div className="loading-animation"><div className="lds-circle"><div></div></div></div>
                }
            </div>
        );
    }
}

export default Accounts;