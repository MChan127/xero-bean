import React, {Component, useEffect} from "react";
import ReactDOM from "react-dom";

const JsonDataTable = ({rawData, name}) => {
    useEffect(() => {
        // console.log('json data table', data);
    }, [rawData]);
    
    let {data, columns} = sortDataAndGetColumns(rawData);

    // not all rows share the same data across each column
    // effectively there are a lot of empty cells, but to render a full table
    // we need _all_ of the columns in the data
    function sortDataAndGetColumns(rawData) {
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
        // why? the first item could still itself be missing some columns that others
        // might have

        // so there's one more step in the process
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

    function getTableHtml() {
        let tableHeaderHtml = [];
        let tableRowsHtml = [];

        let renderedTableHeader = false;
        for (let index in data) {
            let item = data[index];
            let tableRowHtml = [];

            // we're looping through our master list of columns generated from before
            // instead of just in each item
            for (let key of columns) {
                if (!renderedTableHeader) {
                    tableHeaderHtml.push((<th className={"json-col--" + key} key={"th--" + key}>{key}</th>));
                }


                let val = item[key];

                if (Array.isArray(val)) {
                    val = val.map(function(subVal, i) {
                        return subVal[Object.keys(subVal)[0]];
                    }).join(', ');
                } else if (typeof val !== "string") {
                    val = '';
                }

                tableRowHtml.push(<td className={"json-col--" + key} key={"td--" + key + "--" + index}>{val}</td>);
            }
            if (!renderedTableHeader) {
                tableHeaderHtml = (<tr key={"tr--th"}>{tableHeaderHtml}</tr>);
                renderedTableHeader = true;
            }


            tableRowsHtml.push(<tr key={"tr--" + index}>{tableRowHtml}</tr>);
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

    return (
        <div className={"json-data-table " + name}>
            {getTableHtml()}
        </div>
    );
};
export default JsonDataTable;