var document, store, volatile_store;
const electron = require("electron");
var dialog = electron.remote.dialog; // Load the dialogs component of the OS
var fs = require('fs');
var path = require('path');


const accepted_types = ['png','jpg','jpeg', 'pdf', 'doc', 'docx'];
const prefix_to_type = {'png':'png', 'jpg':'jpeg', 'jpeg':'jpeg', 'pdf':'pdf', 'docx':'docx', 'doc':'docx'};

const load_file = (filename) => {
    const filetype_indicators = filename.split(".");
    const filetype = filetype_indicators[filetype_indicators.length - 1];
    if(accepted_types.indexOf(filetype) == -1){
        alert(filename+" has an unsupported filetype. The supported types are: "+accepted_types.toString());
        return;
    }
    fs.readFile(filename, (err, data) => {
        if(err){
            alert("An error ocurred reading the file :" + err.message);
            return;
        }
        volatile_store["documents"].push({'name': filename, 'data': data, 'type':prefix_to_type[filetype], size:data.length});
        updateDocumentList();
    });
};

const classify_action = ()=>{
    loadState("rules");
};
const extract_text = ()=>{
    loadState("text");
};
const add_document = ()=>{
    dialog.showOpenDialog({properties: ['openFile', 'multiSelections']}, (fileNames) => {
        if(fileNames === undefined){
            console.log("No file selected");
            return;
        }
        for(let i = 0; i < fileNames.length; ++i){
            let filename = fileNames[i];
            if(!filename.endsWith(".pdf")){
                alert(filename+" is not a pdf!");
                continue;
            }
            load_file(filename);
        }
    });    
};

const add_word = ()=>{
    dialog.showOpenDialog({properties: ['openFile', 'multiSelections']}, (fileNames) => {
        if(fileNames === undefined){
            console.log("No file selected");
            return;
        }
        for(let i = 0; i < fileNames.length; ++i){
            let filename = fileNames[i];
            if(!(filename.endsWith(".docx") || filename.endsWith(".doc"))){
                alert(filename+" is not a word document!");
                continue;
            }
            load_file(filename);
        }
    });
};

const add_image = ()=>{
    dialog.showOpenDialog({properties: ['openFile', 'multiSelections']}, (fileNames) => {
        if(fileNames === undefined){
            console.log("No file selected");
            return;
        }
        for(let i = 0; i < fileNames.length; ++i){
            load_file(fileNames[i]);
        }
    });    
};

const add_folder = ()=>{
    dialog.showOpenDialog({properties: ['openFile', 'openDirectory']}, (fileNames) => {
        if(fileNames === undefined){
            console.log("No folder selected");
            return;
        }
        for(let i = 0; i < fileNames.length; ++i){
            let dirname = fileNames[i];

            fs.readdir(dirname, (dir_err, files)=>{
                if(dir_err){
                    alert("An error ocurred reading the directory :" + dir_err.message);
                    return;
                }

                files.forEach((file, idx)=>{
                    let filename = path.join(dirname, file);
                    fs.stat(filename, (stat_err, stat)=>{
                        if(stat_err){
                            alert("An error ocurred reading the file :" + stat_err.message);
                            return;
                        }
                        if(stat.isFile()){
                            load_file(filename);
                        }
                        else{
                            console.log("Ignoring %s, is not a file", filename);
                        }
                    });
                });
            });
        }
    });    
};

const clear_all = ()=>{
    volatile_store["documents"] = [];
    updateDocumentList();
};
const clear_selected = ()=>{
    for(let i=0; i<volatile_store["selected"].length; ++i){
        let idx = volatile_store["documents"].map((e)=>{return e.name}).indexOf(volatile_store["selected"][i]);
        if(idx > -1){
            volatile_store["documents"].splice(idx, 1);
        }
    }
    $("tr").removeClass('active');  
    volatile_store["selected"] = [];
    updateDocumentList();
};

const updateDocumentList = ()=>{
    $(document).find("table tbody").empty();
    for(let i=0; i<volatile_store["documents"].length; ++i){
        const curr_doc = volatile_store["documents"][i];
        $(document).find("table tbody").append( "<tr data-item='"+curr_doc.name+"'>"+
                                                "<td>"+curr_doc.name+"</td>"+
                                                "<td>"+curr_doc.type+"</td>"+
                                                "<td>"+Math.floor(curr_doc.size/1024)+" KB</td>"+
                                                "<td></td>"+
                                                "</tr>");
    }
};

const table_click = (e) => {
    let row = $(e.target).parent('tr');
    let item = $(row).data("item");
    if(volatile_store["selected"].indexOf(item) == -1){
        volatile_store['selected'].push(item);
        $(row).addClass('active');
        if(volatile_store['selected'].length == 1){
            $(document).find('.selected-group').fadeIn(100).css('display', 'inline-block');
        }
    }
    else {
        volatile_store['selected'].splice(volatile_store['selected'].indexOf(item), 1);
        $(row).removeClass('active');
        if(volatile_store['selected'].length == 0){
            $(document).find('.selected-group').hide(100);
        }
    }
};

const on_init = (_document, _store, _volatile_store)=>{
    document = _document;
    store = _store;
    volatile_store = _volatile_store;
    $(document).find("#extract-text").on('click', extract_text);
    $(document).find("#classify").on('click', classify_action);
    $(document).find("#add-document").on('click', add_document);
    $(document).find("#add-image").on('click', add_image);
    $(document).find("#add-folder").on('click', add_folder);
    $(document).find("#add-word").on('click', add_word);
    $(document).find("#clear-all").on('click', clear_all);
    $(document).find("#clear-selected").on('click', clear_selected);
    $(document).find("#save-state").on('click', save_state);
    $(document).find("tbody").on('click', table_click);
    if(volatile_store["documents"] == undefined){
        volatile_store["documents"] = [];
        store.find({"key":"documents"}, (err, docs)=>{
            if(err){
                console.log("Persistence Error: %s", err.message);
                return;
            }
            for(let i=0; i<docs.length; ++i){
                for(let j=0; j<docs[i].data.length; ++j){
                    load_file(docs[i].data[j]);
                }
            }
            updateDocumentList();
        });
    }
    volatile_store["selected"] = [];
    updateDocumentList();
};

const on_unload = (document)=>{

}

exports.on_init = on_init;
exports.on_unload = on_unload;