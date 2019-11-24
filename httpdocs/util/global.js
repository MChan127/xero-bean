import axios, {get, post} from "axios";

const handleError = function(err) {
    if (Array.isArray(err)) {
        alert(err.join('\n'));
    } else {
        alert(err);
    }
};

const axiosGet = function(url, callback) {
    get(
        url,
    ).then(res => {
        callback(res, handleError);
    }, err => {
        handleError(!err.response && err.response.data ? err : err.response.data.errors);
    }).catch(err => {
        handleError(!err.response && err.response.data ? err : err.response.data.errors);
    })
};

const axiosPost = function(url, data, callback) {
    const formData = new FormData();
    for (let key in data) {
        const val = data[key];
        formData.append(key, val);
    }

    post(
        url,
        formData,
        {headers: {'content-type': 'application/x-www-form-urlencoded'}},
    ).then(res => {
        callback(res, handleError);
    }, err => {
        handleError(err.response && err.response.data ? err.response.data.errors : err);
    }).catch(err => {
        handleError(err.response && err.response.data ? err.response.data.errors : err);
    })
};

export {axiosGet, axiosPost};