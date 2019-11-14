const $ = require('jquery');

var _state = null;
var current_scripts = null;

var Datastore = require("nedb");
var store = new Datastore({filename: "frontend-state.db", autoload: true});
var volatile_store = {};

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
    loadState("data-selection");
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