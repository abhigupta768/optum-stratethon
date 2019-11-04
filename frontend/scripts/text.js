var selected_item = -1, viewing_item = -1, current_ruleset=-1;
var s, e;
var pdfUtil = require('pdf-to-text');
const textract = require('textract');

const updateDocumentList = ()=>{
    $(document).find("table tbody").empty();
    for(let i=0; i<volatile_store["edocs"].length; ++i){
        const curr_doc = volatile_store["edocs"][i];
        $(document).find("table tbody").append( "<tr data-item='"+curr_doc.name+"'>"+
                                                "<td>"+curr_doc.name+"</td>"+
                                                "<td>"+curr_doc.type+"</td>"+
                                                "</tr>");
    }
};

const table_click = (e) => {
    let row = $(e.target).parent('tr');
    let item = $(row).data("item");
    if(selected_item == item){
        //Unselect
        $(document).find('.selected-group').hide(100);
        $("tr").removeClass('active');
        selected_item = -1;
        return;
    }
    if(selected_item == -1){
        //Show Selection
        $(document).find('.selected-group').fadeIn(100).css('display', 'inline-block');
    }
    else{
        //Change Selection
        $("tr").removeClass('active');
    }
    $(row).addClass('active');
    selected_item = item;
};

const classify_action = ()=>{
    loadState("rules");
};

const ocr = ()=>{
    volatile_store['documents'].forEach(function(document){
        if (document["name"].endsWith(".pdf"))
            pdfUtil.pdfToText(document["name"], function(err, result) {
                if (err) {
                    console.log(err+". Error while extracting document"+document["name"]);
                    alert("Error in reading OCR");
                }else {
                    result = result.replace(/\s+/g, ' ').trim();
                    //output the document object:
                    volatile_store['edocs'].push({
                        "name": document["name"],
                        "type": document["type"],
                        "data": result
                    });
                    updateDocumentList();
                }
            });
        else if (document["name"].endsWith(".docx") || document["name"].endsWith(".doc"))
            textract.fromFileWithPath(document["name"], function( error, result ) {
                console.log(error);
                result = result.replace(/\s+/g, ' ').trim();
                volatile_store['edocs'].push({
                    "name": document["name"],
                    "type": document["type"],
                    "data": result
                });
                updateDocumentList();
            });
    });
};

const remove_doc = ()=>{
    $(document).find('.selected-group').hide(100);
    $("tr").removeClass('active');
    const idx = volatile_store["edocs"].map((e)=>(e.name)).indexOf(selected_item);
    if(idx>-1)  volatile_store["edocs"].splice(idx, 1);
    updateDocumentList();
    selected_item = -1;
}

const open_view = ()=>{
    if(selected_item == -1 || viewing_item != -1){
        $(document).find(".view-pane").hide(100, ()=>{
            viewing_item = -1;
            if(selected_item != -1) open_view();
        });
        return;
    }
    else{
        viewing_item = selected_item;
        let idx = volatile_store["edocs"].map((e)=>(e.name)).indexOf(viewing_item);
        $(document).find("#doc-text").val(volatile_store["edocs"][idx].data);
        $(".view-pane").show(100);
    }
}

const view_action = ()=>{
    $(document).find(".view-group").css("display", "inline-block");
    open_view();
}
const train_rule = ()=>{
    $(document).find(".view-group").css("display", "none");
    open_view();
}

const discard_view = ()=>{
    $(document).find("#doc-text").val("");
    $(document).find(".tagging-header").hide(100);
    $(".view-pane").hide(100);
    viewing_item = -1;
}

const save_view = ()=>{
    let idx = volatile_store["edocs"].map((e)=>(e.name)).indexOf(viewing_item);
    volatile_store["edocs"][idx].data = $(document).find("#doc-text").val();
    $(document).find(".tagging-header").hide(100);
    $(document).find(".view-pane").hide(100);
    viewing_item = -1;
}

const toggle_tag_list = ()=>{
    if($(document).find(".tagging-header").css("display") == "none"){
        $(document).find(".tagging-header").show(100);
        if(volatile_store['rulesets'] == undefined){
            alert("Please open Rules pane to load rules and rulesets.");
        }
        else{
            let element =   "<option>"+
                                "Choose Ruleset"+
                                "</option>";
            $(document).find("#ruleset-list").append(element);
            for(let i=0; i<volatile_store['rulesets'].length; ++i){
                const ruleset = volatile_store['rulesets'][i];
                let element =   "<option value='"+ruleset.name+"'>"+
                                ruleset.name+
                                "</option>";
                $(document).find("#ruleset-list").append(element);
            }
        }
    }
    else{
        $(document).find(".tagging-header").hide(100);
    }
}

const load_rule_list = ()=>{
    let ruleset_name = $(document).find("#ruleset-list").val();
    console.log(ruleset_name);
    let ruleset_idx = volatile_store["rulesets"].map((e)=>(e.name)).indexOf(ruleset_name);
    current_ruleset = ruleset_idx;
    let ruleset = volatile_store["rulesets"][ruleset_idx];
    console.log(volatile_store["rulesets"]);
    console.log(ruleset);
    let rules_list = ruleset.rules;
    
    let element =   "<option>"+
                    "Choose Rule"+
                    "</option>";
    $(document).find("#rule-list").append(element);
    for(let i=0; i<rules_list.length; ++i){
        let element =   "<option value='"+rules_list[i].name+"'>"+
                        rules_list[i].name+
                        "</option>";
        $(document).find("#rule-list").append(element);
    }
};

const add_tag = ()=>{
    const rule_name = $(document).find("#rule-list").val();
    const ruleset = volatile_store["rulesets"][current_ruleset];
    const rule_idx = ruleset.rules.map((e)=>(e.name)).indexOf(rule_name);
    if(rule_idx == -1){
        alert("Invalid Rule");
        return;
    }

    // save selected text in examples list
    // save context chars in context_list
    ruleset.rules[rule_idx].example_list.push($(document).find("#selection").val());
    ruleset.rules[rule_idx].context_list.push($(document).find("#doc-text").val().substring(s-7, e+7));
}

const doc_blur = ()=>{
    let elem = $(document).find("#doc-text");
    s=elem[0].selectionStart;
    e=elem[0].selectionEnd;
    $(document).find("#selection").val(elem.val().substring(s, e));
}
var document, store, volatile_store;
const on_init = (_document, _store, _volatile_store)=>{
    selected_item = -1;
    document = _document;
    store = _store;
    volatile_store = _volatile_store;
    if(volatile_store["edocs"] == undefined){
        volatile_store["edocs"] = [];
        store.find({"key":"edocs"}, (err, docs)=>{
            if(err){
                console.log("Persistence Error: %s", err.message);
                return;
            }
            for(let i=0; i<docs.length; ++i){
                for(let j=0; j<docs[i].data.length; ++j){
                    volatile_store["edocs"].push(docs[i].data[j]);
                }   
            }
            updateDocumentList();
        });
    }
    updateDocumentList();
    $(document).find("#ocr").on('click', ocr);
    $(document).find("#classify").on('click', classify_action);
    $(document).find("#remove-doc").on('click', remove_doc);
    $(document).find("#save-state").on('click', save_state);
    $(document).find("#save-view").on('click', save_view);
    $(document).find("#train-rule").on('click', train_rule);
    $(document).find("#view").on('click', view_action);
    $(document).find("#discard-view").on('click', discard_view);
    $(document).find("#tag-selection").on('click', toggle_tag_list);
    $(document).find("#tag").on("click", add_tag);
    $(document).find("tbody").on('click', table_click);
    $(document).find("#ruleset-list").on("change", load_rule_list);
    $(document).find("#doc-text").on("blur", doc_blur);
};

const on_unload = (document)=>{
    
}

exports.on_init = on_init;
exports.on_unload = on_unload;