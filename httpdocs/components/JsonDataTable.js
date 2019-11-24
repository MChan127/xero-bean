import React, {Component, useEffect} from "react";
import ReactDOM from "react-dom";

class JsonDataTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            name: props.name,
            data: props.data,
            columns: props.columns,
            showColumns: (function(columns) {
                let stateObj = {};
                for (let key of columns) {
                    stateObj[key] = true;
                }
                return stateObj;
            })(props.columns),
        };
    }

    getTableHtml() {
        let tableHeaderHtml = [];
        let tableRowsHtml = [];

        let {data, columns} = this.state;

        let renderedTableHeader = false;
        for (let index in data) {
            let item = data[index];
            let tableRowHtml = [];

            // we're looping through our master list of columns generated from before
            // instead of just in each item
            for (let key of columns) {
                if (!renderedTableHeader) {
                    tableHeaderHtml.push((<th style={{ display: this.state.showColumns[key] ? "table-cell": "none" }} 
                        className={"json-col--" + key} 
                        key={"th--" + key}>{key}</th>));
                }


                let val = item[key];

                // if (Array.isArray(val)) {
                //     val = val.map(function(subVal, i) {
                //         return subVal[Object.keys(subVal)[0]];
                //     }).join(', ');
                // } else if (typeof val !== "string") {
                //     val = '';
                // }

                tableRowHtml.push((<td style={{ display: this.state.showColumns[key] ? "table-cell": "none" }} 
                    className={"json-col--" + key} 
                    key={"td--" + key + "--" + index}>{val}</td>));
            }
            if (!renderedTableHeader) {
                tableHeaderHtml = ((<tr key={"tr--th"}>{tableHeaderHtml}</tr>));
                renderedTableHeader = true;
            }


            tableRowsHtml.push((<tr key={"tr--" + index}>{tableRowHtml}</tr>));
        }

        return (
            <table className="table-bordered thead-dark table-striped table-hover table-sm">
                <thead>
                    {tableHeaderHtml}
                </thead>
                <tbody>
                    {tableRowsHtml}
                </tbody>
            </table>  
        );
    }

    toggleColumn(name) {
        return function(event) {
            if (!event.target.checked) {
                this.setState(prevState => {
                    return {
                        showColumns: {
                            ...prevState.showColumns,
                            [name]: false,
                        }
                    };
                });
            } else {
                this.setState(prevState => {
                    return {
                        showColumns: {
                            ...prevState.showColumns,
                            [name]: true,
                        }
                    };
                });
            }
        };
    }

    toggleColumns(hideAll = false) {
        const that = this;
        return function(e) {
            if (hideAll) {
                that.setState({
                    showColumns: (function() {
                        let stateObj = {};
                        for (let key of that.state.columns) {
                            stateObj[key] = false;
                        }
                        return stateObj;
                    })()
                }, () => {
                    document.querySelectorAll('input[type="checkbox"]').forEach((i) => {
                        i.checked = false;
                    });
                });
            } else {
                that.setState({
                    showColumns: (function() {
                        let stateObj = {};
                        for (let key of that.state.columns) {
                            stateObj[key] = true;
                        }
                        return stateObj;
                    })()
                }, () => {
                    document.querySelectorAll('input[type="checkbox"]').forEach((i) => {
                        i.checked = true;
                    });
                });
            }
        };
    }

    getTableFilterOptions() {
        let filterCheckboxes = [];

        // select all and deselect all options
        filterCheckboxes.push((
            <div key="show-all-columns-btn" className="show-all-columns-btn col-md-3 col-sm-6">
                <button className="btn btn-success" onClick={this.toggleColumns(false).bind(this)}>Show All</button>
            </div>
        ));
        filterCheckboxes.push((
            <div key="hide-all-columns-btn" className="hide-all-columns-btn col-md-3 col-sm-6">
                <button className="btn btn-danger" onClick={this.toggleColumns(true).bind(this)}>Hide All</button>
            </div>
        ));
        filterCheckboxes.push((
            <div key="table-filter-padding-col" className="table-filter-padding-col col-md-6 hidden-sm-down">&nbsp;</div>
        ));

        for (let key of this.state.columns) {
            filterCheckboxes.push((
                <div key={'json-toggle--' + key + '--div'} className="col-md-3">
                    <input key={'json-toggle--' + key} type="checkbox" 
                        onChange={this.toggleColumn(key).bind(this)}
                        defaultChecked={this.state.showColumns[key]}
                        value={this.state.showColumns[key]} /> 
                    <span> &nbsp;{ key }</span>
                </div>
            ));
        }

        return (
            <div className="json-table-filter-options container">
                <div className="row">
                    {filterCheckboxes}
                </div>
            </div>
        )   
    }

    render() {
        return (
            <div className={"json-data-table " + this.state.name}>
                {this.getTableFilterOptions.bind(this)()}

                {this.getTableHtml.bind(this)()}
            </div>
        );
    }
};
export default JsonDataTable;