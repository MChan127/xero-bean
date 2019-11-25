import axios, {get, post} from "axios";

const handleError = function(rawError) {
    let errData = null;
    if (rawError.response && (errData = rawError.response.data)) {
        // if noauth parameter, redirect because the user isn't logged in
        if (errData.noauth == true) {
            window.location.replace('/');
            return;   
        }

        errData = rawError.response.data.errors ? rawError.response.data.errors : rawError;
    }

    if (Array.isArray(errData)) {
        alert(errData.join('\n'));
    } else {
        alert(errData);
    }
};

const axiosGet = function(url, callback) {
    get(
        url,
    ).then(res => {
        callback(res, handleError);
    }, err => {
        handleError(err);
    }).catch(err => {
        handleError(err);
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
        handleError(err);
    }).catch(err => {
        handleError(err);
    })
};

export {axiosGet, axiosPost};