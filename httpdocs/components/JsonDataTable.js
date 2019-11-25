import React, {Component, useEffect} from "react";
import ReactDOM from "react-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faSync } from '@fortawesome/free-solid-svg-icons';

class JsonDataTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            hiddenColumns: [], // from the last filter
            hideColumns: [],
            whereColumns: [],
            selectColumnWhere: null,
            selectColumnWhereMatches: '',
            selectSortColumn: null,
            selectSortOrder: null,
            tableHtml: this.getTableHtml.bind(this)(),
            loading: true,
            noResults: false,
        };
    }

    componentWillReceiveProps(newProps) {
        if (newProps.data && Object.keys(newProps.data).length > 0 && !this.state.noResults) {
            this.getTableHtml.bind(this)(newProps);
        } else {
            this.setState({
                noResults: true,
            });
        }
    }

    getTableHtml(newProps = null) {
        let tableHeaderHtml = [];
        let tableRowsHtml = [];
        
        // let data = newData && Object.keys(newData).length > 0 ? newData : this.props.data;
        // columns are more complicated since they're not meant to change
        // console.log('old props', this.props.columns);
        // let columns = newColumns && Object.keys(newColumns).length > 0 ? newColumns : this.props.columns;
        // console.log('get table html', data, columns);
        let {data, columns} = newProps ? newProps : this.props;

        if (!data || Object.keys(data).length < 1) {
            return;
        }

        let renderedTableHeader = false;
        for (let index in data) {
            let item = data[index];
            let tableRowHtml = [];

            // we're looping through our master list of columns generated from before
            // instead of just in each item
            for (let key of columns) {
                if (this.state.hiddenColumns.indexOf(key) > -1) {
                    continue;
                }
                if (!renderedTableHeader) {
                    tableHeaderHtml.push((<th className={"json-col--" + key} 
                        key={"th--" + key}>{key}</th>));
                }


                let val = item[key];

                tableRowHtml.push((<td className={"json-col--" + key} 
                    key={"td--" + key + "--" + index}>{val}</td>));
            }
            if (!renderedTableHeader) {
                tableHeaderHtml = ((<tr key={"tr--th"}>{tableHeaderHtml}</tr>));
                renderedTableHeader = true;
            }


            tableRowsHtml.push((<tr key={"tr--" + index}>{tableRowHtml}</tr>));
        }

        this.setState({
            tableHtml: (
                <table className="table-bordered thead-dark table-striped table-hover table-sm">
                    <thead>
                        {tableHeaderHtml}
                    </thead>
                    <tbody>
                        {tableRowsHtml}
                    </tbody>
                </table>  
            ),
            loading: false,
        });
    }

    toggleColumn(name) {
        return function(event) {
            if (!event.target.checked) {
                this.setState(prevState => {
                    return {
                        hideColumns: prevState.hideColumns.concat(name)
                    };
                });
            } else {
                this.setState(prevState => {
                    let hideColumns = JSON.parse(JSON.stringify(prevState.hideColumns));
                    hideColumns.splice(hideColumns.indexOf(name), 1);
                    return {
                        hideColumns,
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
                    hideColumns: (function() {
                        return that.props.columns;
                    })()
                }, () => {
                    document.querySelectorAll('input[type="checkbox"]').forEach((i) => {
                        i.checked = false;
                    });
                });
            } else {
                that.setState({
                    hideColumns: []
                }, () => {
                    document.querySelectorAll('input[type="checkbox"]').forEach((i) => {
                        i.checked = true;
                    });
                });
            }
        };
    }

    filterData() {
        let where = '', hide = '',
            whereColumns = this.state.whereColumns ? this.state.whereColumns : [],
            hideColumns = this.state.hideColumns ? this.state.hideColumns : [],
            order = (this.state.selectSortColumn && this.state.selectSortOrder) ?
                 '&order=' + this.state.selectSortColumn + ',' + this.state.selectSortOrder : '';
        if (whereColumns.length > 0) {
            for (let i = 0; i < whereColumns.length; i++) {
                where += '&' + whereColumns[i].column + '=' + whereColumns[i].value;
            }
        }
        if (hideColumns.length > 0) {
            hide = '&columns=' + hideColumns.join(',');
        }

        let filters = (where + hide + order).trim();

        // allow the user to "reset" their criteria
        // if (filters.length < 1) {
        //     alert("You must set at least one search criteria");
        //     return;
        // }
        
        const that = this;
        this.setState({
            hiddenColumns: this.state.hideColumns,
            loading: true,
            noResults: false,
        }, () => {
            that.props.refetch(filters);
        });
    }

    handleInputChange(type = 'text') {
        const that = this;
        return (event) => {
            const target = event.target;    

            let value;
            switch(type) {
                case 'checkbox':
                    value = target.checked;
                    break;
                default:
                    value = target.value;
            }

            that.setState({
                [target.name]: value
            });
        };
    }

    addWhereFilter() {
        let column = this.state.selectColumnWhere,
            value = this.state.selectColumnWhereMatches;

        if (!column || !value || column.trim().length < 1 || value.trim().length < 1) {
            alert("You must enter a value to filter");
            return;
        }

        this.setState(prevState => {
            return {
                whereColumns: prevState.whereColumns.concat({
                    column,
                    value,
                }),
                selectColumnWhereMatches: '',
            };
        });
    }

    removeWhereFilter(idx) {
        const that = this;
        return function() {
            that.setState(prevState => {
                let whereColumns = JSON.parse(JSON.stringify(prevState.whereColumns));
                whereColumns.splice(idx, 1);
                return {
                    whereColumns,
                };
            });
        };
    }

    getTableFilterOptions() {
        const that = this;

        let filterCheckboxes = [];
        let filterWhere = [];
        let sortOrder = [];

        // select all and deselect all options
        filterCheckboxes.push((
            <div key="show-all-columns-btn" className="show-all-columns-btn col-md-3 col-sm-6">
                <button className="btn btn-primary" onClick={this.toggleColumns(false).bind(this)}>Show All</button>
            </div>
        ));
        filterCheckboxes.push((
            <div key="hide-all-columns-btn" className="hide-all-columns-btn col-md-3 col-sm-6">
                <button className="btn btn-primary" onClick={this.toggleColumns(true).bind(this)}>Hide All</button>
            </div>
        ));
        filterCheckboxes.push((
            <div key="table-filter-padding-col" className="table-filter-padding-col col-md-6 hidden-sm-down">&nbsp;</div>
        ));

        for (let key of this.props.columns) {
            filterCheckboxes.push((
                <div key={'json-toggle--' + key + '--div'} className="col-md-3">
                    <input key={'json-toggle--' + key} type="checkbox" 
                        onChange={this.toggleColumn(key).bind(this)}
                        defaultChecked={this.state.hideColumns.indexOf(key) < 0}
                        value={this.state.hideColumns.indexOf(key) < 0} /> 
                    <span> &nbsp;{ key }</span>
                </div>
            ));

            // if (this.state.whereColumns.indexOf(key) < 0) {
            filterWhere.push(
                <option key={'json-search-option-' + key} value={key}>{key}</option>
            );
            sortOrder.push(
                <option key={'json-sort-option-' + key} value={key}>{key}</option>
            );
            // }
        }
        filterWhere = (
            <div className="json-search col-md-12 row">
                <div key={'json-search-select--div'} className="col-md-4 form-group">
                    <label htmlFor="selectColumnWhere">Column:</label>
                    <select className="form-control" 
                        name="selectColumnWhere"
                        onChange={this.handleInputChange().bind(this)}
                        defaultValue={this.state.selectColumnWhere}>
                        <option value=''></option>
                        {filterWhere}
                    </select>
                </div>
                <div key={'json-search-input--div'} className="col-md-4 form-group">
                    <label htmlFor="selectColumnWhereMatches">Matches:</label>
                    <input type="text" className="form-control"
                        placeholder="Enter value" 
                        name="selectColumnWhereMatches" 
                        value={this.state.selectColumnWhereMatches}
                        onChange={this.handleInputChange().bind(this)}
                        required />
                </div>
                <div key={'json-search-add--btn'} className="col-md-4">
                    <button className="btn btn-primary" onClick={this.addWhereFilter.bind(this)}>Add</button>
                </div>

                <div key={'json-where-filters'} className="col-md-6">
                    {(function(filters) {
                        return filters.map((item, i) => (<div key={'json-where-filter--' + i}>
                            <span className="remove-where-filter-btn"
                                onClick={that.removeWhereFilter(i).bind(this)}>
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </span>
                            {item.column + ' MATCHES EXACTLY ' + item.value}
                        </div>));
                    })(this.state.whereColumns)}
                </div>
            </div>
        );
        
        sortOrder = (
            <div className="json-sort col-md-12 row">
                <div key={'json-sort-column--div'} className="col-md-4 form-group">
                    <label htmlFor="selectSortColumn">Column:</label>
                    <select className="form-control" 
                        name="selectSortColumn"
                        onChange={this.handleInputChange().bind(this)}
                        defaultValue={this.state.selectSortColumn}>
                        <option value=''></option>
                        {sortOrder}
                    </select>
                </div>
                <div key={'json-sort-order--div'} className="col-md-4 form-group">
                    <label htmlFor="selectSortOrder">Sort order:</label>
                    <select className="form-control" 
                        name="selectSortOrder"
                        onChange={this.handleInputChange().bind(this)}
                        defaultValue={this.state.selectSortOrder}>
                        <option value=''></option>
                        <option value='ASC'>Ascending</option>
                        <option value='DESC'>Descending</option>
                    </select>
                </div>
            </div>
        )

        return (
            <div className="json-table-filter-options container">
                <div className="row">
                    {filterCheckboxes}
                </div>
                <div className="row">
                    {sortOrder}
                </div>
                <div className="row">
                    {filterWhere}
                </div>
                <button className="btn btn-success" onClick={this.filterData.bind(this)}>Filter</button>
            </div>
        )   
    }

    refresh() {
        const that = this;
        this.setState({
            loading: true,
        }, () => {
            that.props.refresh();
        });
    }

    render() {
        return (
            <div className={"json-data-table " + this.props.name}>
                <div className="sync-xero-data" onClick={this.refresh.bind(this)}>
                    <FontAwesomeIcon icon={faSync} />
                </div>

                {this.getTableFilterOptions.bind(this)()}

                {
                    (this.state.tableHtml && !this.state.loading) ? this.state.tableHtml :
                    (this.state.noResults === true ? <p>No data matched the search criteria</p> : 
                        <div className="loading-animation"><div className="lds-circle"><div></div></div></div>)
                }
            </div>
        );
    }
};
export default JsonDataTable;