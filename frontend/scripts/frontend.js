const $ = require('jquery');

var _state = null;
var current_scripts = null;

var Datastore = require("nedb");
var store = new Datastore({filename: "frontend-state.db", autoload: true});
var volatile_store = {};

const save_classify = ()=>{
    if(volatile_store['classified'] == undefined) return; 
    store.update({"key":"classified"}, {"key":"classified", "data":volatile_store['classified']}, {}, (err, numReplaced)=>{
        if(err) console.log("Persistence Error: "+err.message);
        console.log("Replaced: "+numReplaced);
        if(numReplaced == 0){
            store.insert({"key":"classified", "data":volatile_store['classified']}, (err, doc)=>{
                if(err) console.log("Persistence Error: "+err.message);
                console.log("New Doc: %o",doc);
            });
        }
    });
}

const save_docs = () => {
    if(volatile_store['documents'] == undefined) return; 
    let doc_list = [];
    for(let i = 0; i<volatile_store["documents"].length; ++i){
        doc_list.push(volatile_store["documents"][i].name);
    };
    store.update({"key":"documents"}, {"key":"documents", "data":doc_list}, {}, (err, numReplaced)=>{
        if(err) console.log("Persistence Error: "+err.message);
        console.log("Replaced: "+numReplaced);
        if(numReplaced == 0){
            store.insert({"key":"documents", "data":doc_list}, (err, doc)=>{
                if(err) console.log("Persistence Error: "+err.message);
                console.log("New Doc: %o",doc);
            });
        }
    });
};

const save_rules = () => {
    if(volatile_store['rulesets'] == undefined) return; 
    store.update({"key":"rulesets"}, {"key":"rulesets", "data":volatile_store['rulesets']}, {}, (err, numReplaced)=>{
        if(err) console.log("Persistence Error: "+err.message);
        console.log("Replaced: "+numReplaced);
        if(numReplaced == 0){
            store.insert({"key":"rulesets", "data":volatile_store['rulesets']}, (err, doc)=>{
                if(err) console.log("Persistence Error: "+err.message);
                console.log("New Doc: %o",doc);
            });
        }
    });
};

const save_text = () => {
    if(volatile_store['edocs'] == undefined) return; 
    store.update({"key":"edocs"}, {"key":"edocs", "data":volatile_store['edocs']}, {}, (err, numReplaced)=>{
        if(err) console.log("Persistence Error: "+err.message);
        console.log("Replaced: "+numReplaced);
        if(numReplaced == 0){
            store.insert({"key":"edocs", "data":volatile_store['edocs']}, (err, doc)=>{
                if(err) console.log("Persistence Error: "+err.message);
                console.log("New Doc: %o",doc);
            });
        }
    });
};

const save_state = ()=>{
    
    save_docs();
    save_text();
    save_rules();
    save_classify();

}

const loadState = (state)=>{
    let new_scripts = null;
    try{
        new_scripts = require("./scripts/"+state+".js");
    }
    catch(e){
        console.log("Script %s Error.", state+".js");
        console.log("Error: %o", e);
        return;
    };
    $("#loader").load("content/"+state+".html",()=>{
        
        if(current_scripts != null) current_scripts.on_unload(document);
        current_scripts = new_scripts;

        $("#content").empty();
        $("#loader .content-wrapper").clone().appendTo("#content");
        $("#header").empty();
        $("#loader .header-wrapper").clone().appendTo("#header");
        $("#footer").empty();
        $("#loader .footer-wrapper").clone().appendTo("#footer");

        $("#menu-"+_state).removeClass("active");
        $("#menu-"+state).addClass("active");

        $("#loader").empty();

        current_scripts.on_init(document, store, volatile_store);
        _state = state;
    });
};

$(document).ready(()=>{
    loadState("documents");
    // loadState("rules");
    $(".nav-group-item").on("click", (e)=>{
        const id = e.currentTarget.id;
        let state = id; //Fallback To Id
        if(id.startsWith("menu-")){
            state = id.substr(5, id.length - 5);
        }
        else {
            console.log("Unknown ID, falling back to unaltered state %s.", id)
        }
        loadState(state);
    });
});