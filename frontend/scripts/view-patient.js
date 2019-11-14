var document, store, volatile_store;
const electron = require("electron");
var request = require('request');
const con = require('electron').remote.getGlobal('console');
var dialog = electron.remote.dialog; // Load the dialogs component of the OS

const view = () => {
    record_id = document.getElementById("record-id").value
    request.post('http://localhost:2000/view_details',
        { json: { recordID: record_id} },
        function (error, response, body) {
            $(document).find("#patient-det").html(body);
        }
    );
};

const on_init = (_document, _store, _volatile_store)=>{
    document = _document;
    store = _store;
    volatile_store = _volatile_store;
    $(document).find("#view-details").on('click', view);
    volatile_store["selected"] = [];
};

const on_unload = (document)=>{
};

exports.on_init = on_init;
exports.on_unload = on_unload;