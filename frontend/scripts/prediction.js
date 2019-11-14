var document, store, volatile_store;
const electron = require("electron");
var request = require('request');
const con = require('electron').remote.getGlobal('console');
var dialog = electron.remote.dialog; // Load the dialogs component of the OS

const predict = () => {
    record_id = document.getElementById("record-id").value
    request.post('http://localhost:2000/predict',
        { json: { recordID: record_id} },
        function (error, response, body) {
            if (body[0]==='True'){
                $(document).find("#prediction-result").text("Patient dies with probability "+body[1]);
            }
            else{
                var prob = 1-parseFloat(body[1]);
                var probs = prob.toString();
                $(document).find("#prediction-result").text("Patient survives with probability "+probs);
            }
            $(document).find("#time-prediction").text(body[3]);
            $(document).find("#iv-holder").text("The most important vitals that need to be noted for better judgement in order of their importances are:");
            $(document).find("#important-vitals").text(body[2]);
        }
    );
};

const on_init = (_document, _store, _volatile_store)=>{
    document = _document;
    store = _store;
    volatile_store = _volatile_store;
    $(document).find("#make-predictions").on('click', predict);
    volatile_store["selected"] = [];
};

const on_unload = (document)=>{
};

exports.on_init = on_init;
exports.on_unload = on_unload;