var document, store, volatile_store;

const fs = require("fs");
const {dialog} = require("electron").remote;
const {pd} = require('pretty-data');
const pdf = require('html-pdf');

const save_data = (data, filetype)=>{
    dialog.showSaveDialog((filename)=>{
        console.log(filename);
        if(filename === undefined){
            console.log("Cancelled Save");
            return;
        }
        if(Array.isArray(filename)) filename = filename[0];
        if(filename.indexOf(".")===-1) filename = filename + filetype;
        fs.writeFile(filename, data, {encoding: "utf-8"}, (err)=>{
            if(err){
                console.log("Error Writing To File");
                alert("Error Writing To File: "+err.message);
                console.log(err)
            }
            else{
                alert("Saved File");
            }
        })
    });
};

const json_export = ()=>{
    const classified = volatile_store['classified'];
    if(classified === undefined) return;
    let json_output = JSON.stringify(classified);
    json_output = pd.json(json_output);
    console.log(json_output, 4);
    save_data(json_output, ".json");
};

const xml_export = ()=>{
    const classified = volatile_store['classified'];
    if(classified === undefined) return;
    //Get Data
    let data = "";
    for(let i = 0; i<classified.length; ++i){
        data += "<document>";
        data += "<name>"+classified[i].name+"</name>";
        data += "<rules>";
        for(let j=0; j<classified[i].data.length; ++j){
            data += "<rule>";
            data +=  "<name>"+classified[i].data[j].name+"</name>";
            data +=  "<data>"+classified[i].data[j].data+"</data>";
            data += "</rule>";
        }
        data += "</rules></document>";
    }
    data = pd.xml(data, 4);
    console.log(data);
    save_data(data, ".xml")
};

const csv_export = ()=>{
    const classified = volatile_store['classified'];
    if(classified === undefined) return;
    //Get Tags
    let headings = "Document Name";
    for(let i=0; i<classified[0].data.length; ++i){
        headings += "@" + classified[0].data[i].name;
    }
    //Get Data
    let data = headings+"\n";
    for(let i = 0; i<classified.length; ++i){
        data += classified[i].name;
        for(let j=0; j<classified[i].data.length; ++j){
            data += "@" + classified[i].data[j].data;
        }
        data += "\n";
    }
    console.log(data);
    save_data(data, ".csv");
};

const pdf_export = ()=>{
    const classified = volatile_store['classified'];
    if(classified === undefined)
        return;

    var HTML = "<html lang=\"en\" xmlns=\"http://www.w3.org/1999/xhtml\">\n" +
        "<head><style>\n" +
        "table {\n" +
        "  border-collapse: collapse;\n" +
        "}"+
        "table, th, td {\n" +
        "  border: 2px solid black;\n" +
        "}\n" +
        "</style>\n" +
        "</head>\n" +
        "<body>\n";

    //Get Data
    for(let i = 0; i<classified.length; ++i){
        HTML += "<p> File: " + classified[i].name + "</p>";
        HTML += "<table><thead><tr><th>Rule Name</th><th>Extracted Value</th></tr></thead><tbody>";
        for(let j=0; j<classified[i].data.length; ++j)
            HTML += "<tr><td>" + classified[i].data[j].name
                + "</td><td>" + classified[i].data[j].data + "</td>";
        HTML += "</tbody></table>\n";
    }

    HTML += "</body>\n</html>";

    console.log(HTML);

    const options = {
        format: 'Letter',
        orientation: "portrait",
        border: "0.5in"
    };

    dialog.showSaveDialog((filename)=>{
        console.log(filename);
        if(filename === undefined){
            console.log("Cancelled Save");
            return;
        }
        if(Array.isArray(filename))
            filename = filename[0];
        if(filename.indexOf(".")===-1)
            filename = filename + ".pdf";

        pdf.create(HTML, options).toFile(filename, function(err, res) {
            if (err)
                console.log(err);
            else
                alert("File saved");
        });
    });
};

const on_init = (_document, _store, _volatile_store)=>{
    document = _document;
    store = _store;
    volatile_store = _volatile_store;
    if(volatile_store["classified"] === undefined){
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
            if(volatile_store["classified"].length === 0){
                alert("You have not classified your documents.");
                loadState("rules");
            }
        });
    }
    $(document).find("#csv").on('click', csv_export);
    $(document).find("#xml").on('click', xml_export);
    $(document).find("#json").on('click', json_export);
    $(document).find("#pdf").on('click', pdf_export);
};

const on_unload = (document)=>{
    
}

exports.on_init = on_init;
exports.on_unload = on_unload;