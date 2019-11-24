import React, {Component, useEffect} from "react";
import ReactDOM from "react-dom";

class JsonDataTable extends React.Component {
    constructor(props) {
        super(props);

        let {data, columns} = this.prepareData(props);

        this.state = {
            ...this.state,
            name: props.name,
            data,
            columns,
            showColumns: (function() {
                let stateObj = {};
                for (let key of columns) {
                    stateObj[key] = true;
                }
                return stateObj;
            })(),
        };
    }
    
    prepareData({rawData}) {
        return this.sortDataAndGetColumns(rawData);
    }

    // not all rows share the same data across each column
    // effectively there are a lot of empty cells, but to render a full table
    // we need _all_ of the columns in the data
    sortDataAndGetColumns(rawData) {
        let dataArr = [];
        let columnsArr = [];

        // first, convert the object of objects into an array for sorting purposes
        for (let index in rawData) {
            let item = rawData[index];
            dataArr[index] = item;
        }

        // now we can sort
        // order from rows with _most columns_ of data to the least
        dataArr.sort(function(a, b) {
            return Object.keys(b).length - Object.keys(a).length;
        });

        // the first item now has the most columns with data
        // iterate through only the first item, and make an array
        // of all the distinct columns in the entire data
        for (let key in dataArr[0]) {
            let val = dataArr[0][key];
            columnsArr.push(key);
        }

        // however, this _still_ isn't good enough
        // why? the first item could still itself be missing some columns that
        // others might have
        // so effectively, there's one more step in the process
        // further filter the rows using the most "common" columns we just found,
        // and find any extraneous columns among the whole data set again by
        // using map-filter-reduce
        const extraColumns = Array.from(dataArr.map(function(item) {
            // for each row basically, we filter to see if there are
            // any columns we left out
            return Object.keys(item).filter(function(key) {
                return !columnsArr.includes(key);
            });

        // once we have the extra columns, it's a simple matter of aggregating and
        // storing them
        }).reduce(function(extra, keys) {
            if (!keys || keys.length < 1) {
                return extra;
            }
            for (let key in keys) {
               extra.add(keys[key]);
            }
            return extra;
        }, new Set()));
        // finally, collect all the columns together into one array
        columnsArr = columnsArr.concat(extraColumns);
        
        return {
            data: dataArr,
            columns: columnsArr
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

                if (Array.isArray(val)) {
                    val = val.map(function(subVal, i) {
                        return subVal[Object.keys(subVal)[0]];
                    }).join(', ');
                } else if (typeof val !== "string") {
                    val = '';
                }

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
                    jQuery('input[type="checkbox"]').prop('checked', false);
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
                    jQuery('input[type="checkbox"]').prop('checked', true);
                });
            }
        };
    }

    getTableFilterOptions() {
        let filterCheckboxes = [];

        // select all and deselect all options
        filterCheckboxes.push((
            <div className="col-md-4">
                <button className="btn btn-success" onClick={this.toggleColumns(false).bind(this)}>Show All</button>
            </div>
        ));
        filterCheckboxes.push((
            <div className="col-md-4">
                <button className="btn btn-danger" onClick={this.toggleColumns(true).bind(this)}>Hide All</button>
            </div>
        ));

        for (let key of this.state.columns) {
            filterCheckboxes.push((
                <div className="col-md-3">
                    <input key={'json-toggle--' + key} type="checkbox" 
                        onChange={this.toggleColumn(key).bind(this)}
                        defaultChecked={this.state.showColumns[key]}
                        value={this.state.showColumns[key]} /> 
                    <span>{ key }</span>
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