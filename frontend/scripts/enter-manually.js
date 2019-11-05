var document, store, volatile_store;
const electron = require("electron");
var request = require('request');
const con = require('electron').remote.getGlobal('console');
var dialog = electron.remote.dialog; // Load the dialogs component of the OS

let params = ['Timestamp','RecordID','Age','BUN','Creatinine','DiasABP','FiO2','GCS','Glucose','HCO3','HCT','HR','ICUType','K','MAP','Mg','Na'
    ,'PaCO2','PaO2','Platelets','Gender','SysABP','Temp','Urine','WBC','Weight','pH'];

const proceed = () => {
    // create csv
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;

    var headers = [];
    var records = {};
    for(var i=0; i<params.length; ++i) {
        headers.push({id: params[i], title: params[i]});
        records[params[i]] = document.getElementById(params[i]).value;
    }

    const csvWriter = createCsvWriter({
        path: 'sample.csv',
        header: headers
    });

    csvWriter.writeRecords([records])       // returns a promise
        .then(() => {
            con.log('created csv');
            predict('sample.csv');
        });
};

const predict = (fname) => {
    request.post('http://localhost:2000/predict',
        { json: { filename: fname} },
        function (error, response, body) {
            if (body[0]==='True')
                $(document).find("#prediction-result").text("Patient dies with probability "+body[1]);
            else
                $(document).find("#prediction-result").text("Patient survives with probability "+1-parseFloat(body[1]));
            $(document).find("#important-vitals").text("The most important vitals that need to be noted in order of their importances are "+body[2]);
        }
    );
};

const on_init = (_document, _store, _volatile_store)=>{
    document = _document;
    store = _store;
    volatile_store = _volatile_store;

    // populate text boxes
    for (var i = 0; i < params.length; i++) {
        var lbl = document.createElement("label");
        lbl.setAttribute("for",params[i]);
        lbl.innerHTML = params[i];
        var txt = document.createElement("input");
        txt.setAttribute("type","text");
        txt.setAttribute("id",params[i]);
        document.getElementById("vitals").appendChild(lbl);
        document.getElementById("vitals").appendChild(txt);
        document.getElementById("vitals").appendChild(document.createElement("br"));
    }

    $(document).find("#proceed").on('click', proceed);
    volatile_store["selected"] = [];
};

const on_unload = (document)=>{
};

exports.on_init = on_init;
exports.on_unload = on_unload;