var document, store, volatile_store;
const electron = require("electron");
var request = require('request');
const con = require('electron').remote.getGlobal('console');
var dialog = electron.remote.dialog; // Load the dialogs component of the OS

const select_csv = ()=>{
    dialog.showOpenDialog({properties: ['openFile', 'multiSelections']}, (fileNames) => {
        if(fileNames === undefined){
            console.log("No file selected");
            return;
        }
        for(let i = 0; i < fileNames.length; ++i){
            let filename = fileNames[i];
            if(!filename.endsWith(".csv")){
                alert(filename+" is not a csv!");
                continue;
            }
            predict(filename);
        }
    });
};

const predict = (fname) => {
    request.post('http://127.0.0.1:5122/predict',
        { json: { filename: fname} },
        function (error, response, body) {
            $(document).find("#prediction-result").text(body);
            if (body[0]==='True')
                $(document).find("#prediction-result").text("Patient dies with probability "+body[1]);
            else
                $(document).find("#prediction-result").text("Patient survives with probability "+1-parseFloat(body[1]));
        }
    );
};

const enter_manually = () => {
    loadState("enter-manually");
};

const on_init = (_document, _store, _volatile_store)=>{
    document = _document;
    store = _store;
    volatile_store = _volatile_store;
    $(document).find("#select-csv").on('click', select_csv);
    $(document).find("#enter-manually").on('click', enter_manually);
    volatile_store["selected"] = [];
};

const on_unload = (document)=>{
};

exports.on_init = on_init;
exports.on_unload = on_unload;