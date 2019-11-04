var document, store, volatile_store;
var Chart = require("chart.js");

const export_action = ()=>{
    loadState("export");
};

const create_pie_chart = ()=>{
    var mLabels = [];
    var mData = [];
    var mBColor = [];

    const colors = [
        'rgba(255, 99, 132, 0.4)',
        'rgba(54, 162, 235, 0.4)',
        'rgba(255, 206, 86, 0.4)',
        'rgba(75, 192, 192, 0.4)',
        'rgba(153, 102, 255, 0.4)',
    ];

    for(var i=0; i < volatile_store["rulesets"].length; ++i)
        if (volatile_store["rulesets"][i]["rules"].length > 0){
            for(var j=0; j < volatile_store["rulesets"][i]["rules"].length; ++j){ // TODO hack
                // if (volatile_store["rulesets"][i]["rules"][j]["examples_list"] !== undefined){
                mLabels.push(volatile_store["rulesets"][i]["rules"][j]["name"]);
                mData.push(j); //volatile_store["rulesets"][i]["rules"][j]["examples_list"].length);
                mBColor.push(colors[i%colors.length]);
            }
        }

    console.log(mLabels);
    console.log(mData);
    console.log(mBColor);

    new Chart(document.getElementById('myChart').getContext('2d'), {
        type: 'pie',
        data: {
            datasets: [{
                data: mData,
                backgroundColor: mBColor,
                label: 'Tagged Rule Examples'
            }],
            labels: mLabels
        },
        options: {
            responsive: true
        }
    });
};

const create_bar_chart = () =>{
    var mLabels = [];

    for(var i=0; i < volatile_store["rulesets"].length; ++i)
        if (volatile_store["rulesets"][i]["rules"].length > 0)
            mLabels.push(volatile_store["rulesets"][i]["name"]);


    new Chart(document.getElementById("myChart").getContext('2d'), {
        type: 'bar',
        data: {
            labels: mLabels,
            datasets: [{
                label: 'Confidence Levels',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
};

const on_init = (_document, _store, _volatile_store)=>{
    document = _document;
    store = _store;
    volatile_store = _volatile_store;

    $(document).find("#export").on('click', export_action);
    $(document).find("#save-state").on('click', save_state);
    $(document).find("#myButton1").on('click', function () {
        if (volatile_store["rulesets"]!==undefined){
            create_pie_chart();
        }else
            alert("Select a ruleset first");
    });
    $(document).find("#myButton2").on('click', function () {
        if (volatile_store["rulesets"]!==undefined){
            create_bar_chart();
        }else
            alert("Select a ruleset first");
    });

    if (volatile_store["rulesets"]!==undefined){
        create_pie_chart(); // by default
    }else
        alert("Select a ruleset first");

};

const on_unload = (document)=>{

};

exports.on_init = on_init;
exports.on_unload = on_unload;