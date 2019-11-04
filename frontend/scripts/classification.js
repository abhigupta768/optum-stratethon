var document, store, volatile_store, selected_doc=-1;

const export_action = ()=>{
    loadState("export");
};

const updateDocumentList = ()=>{
    $(document).find(".list-group .list-group-item").remove();
    for(let i=0; i<volatile_store["classified"].length; ++i){
        const doc = volatile_store["classified"][i];
        $(document).find(".list-group").append( "<li class='list-group-item' data-item='"+doc.name+"'>"+
                                                    "<div class='media-body'>"+
                                                        "<strong>"+doc.name+"</strong>"+
                                                        "<p>Number of extracted data points: "+doc.data.length+"</p>"+  
                                                    "</div>"+
                                                "</li>");
    }
};

    const updateDocumentRules = ()=>{
        $(document).find("table tbody").empty();
        selected_doc.data.sort((a, b)=>(a.rule <= b.rule));
        for(let i=0; i<selected_doc.data.length; ++i){
            const rule = selected_doc.data[i];
            $(document).find("table tbody").append( "<tr data-item='"+rule.name+"'>"+
                                                    "<td>"+rule.name+"</td>"+
                                                    "<td>"+rule.data+"</td>"+
                                                    "</tr>");
        }
    };

    const select_doc = (e)=>{
        if($(e.target).hasClass('list-group-header') || $(e.target).parent('.list-group-header')[0] != undefined) return;
        const doc_name = $(e.target).closest('.list-group-item').data('item');
        const doc_idx = volatile_store['classified'].map((e)=>(e.name)).indexOf(doc_name);
        if(doc_idx == -1){
            alert("Invalid document");
            return;
        }
        selected_doc = volatile_store['classified'][doc_idx];
        $(document).find('.list-group-item').removeClass('active');
        $(e.target).closest('.list-group-item').addClass('active');
        $(document).find('.without-doc').css('display', 'none');
        $(document).find('.with-doc').css('display', 'block');
        $(document).find('.btn-group.with-doc').css('display', 'inline-block');
        updateDocumentRules();
    }

const on_init = (_document, _store, _volatile_store)=>{
    selected_doc=-1;
    document = _document;
    store = _store;
    volatile_store = _volatile_store;
    if(volatile_store["classified"] == undefined){
        volatile_store["classified"] = [];
        store.find({"key":"classified"}, (err, docs)=>{
            if(err){
                console.log("Persistence Error: %s", err.message);
                return;
            }
            for(let i=0; i<docs.length; ++i){
                for(let j=0; j<docs[i].data.length; ++j){
                    volatile_store["classified"].push(docs[i].data[j]);
                }   
            }
            updateDocumentList();
        });
    }
    updateDocumentList();
    $(document).find("#export").on('click', export_action);
    $(document).find("#save-state").on('click', save_state);
    $(document).find(".list-group").on('click', select_doc);
};

const on_unload = (document)=>{
    
}

exports.on_init = on_init;
exports.on_unload = on_unload;