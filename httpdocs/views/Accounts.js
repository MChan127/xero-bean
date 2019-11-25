import React, {Component} from "react";
import ReactDOM from "react-dom";

import {axiosGet} from "../util/global.js";

import Header from "../components/Header";
import JsonDataTable from "../components/JsonDataTable";

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

    fetchXeroData(refresh = false, downloadCsv = false) {
        return function(filters = '') {
            const that = this;

            if (downloadCsv) {
                window.location.href = API_URL + "get_xero_data.php?type=accounts" + (typeof filters == 'string' ? filters : '') 
                + (refresh ? "&refresh=true" : "") + "&download=true";
                return;
            }

            axiosGet(
                API_URL + "get_xero_data.php?type=accounts" + (typeof filters == 'string' ? filters : '') 
                    + (refresh ? "&refresh=true" : ""),
                (res, errorHandler) => {
                    if (!res.data) {
                        errorHandler("Error: Could not fetch accounts");
                        return;
                    }

                    if (filters.trim().length > 0) {
                        // keep the master column list the same if we're just filtering
                        that.setState({
                            data: res.data.data,
                        });
                    } else {
                        that.setState({
                            data: res.data.data,
                            columns: res.data.columns,
                        });
                    }
                }
            );
        };
    }

    render() {
        return (
            <div className="page accounts">
                <Header user={this.props.user} updateUser={this.props.updateUser} />
                <h1>Accounts</h1>

                <JsonDataTable data={this.state.data} 
                    columns={this.state.columns} 
                    refetch={this.fetchXeroData().bind(this)} 
                    refresh={this.fetchXeroData(true).bind(this)}
                    downloadCsv={this.fetchXeroData(false, true).bind(this)}
                    name="Accounts" />
            </div>
        );
    }
}

export default Accounts;