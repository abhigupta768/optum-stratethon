const DEBUG = true;
const electron = require('electron')
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
if(DEBUG) require('electron-reload');

var window;
const backend = "http://localhost:2000";
const request = require('request-promise');
var backendProc = null;
const initWindow = function(){
    window = new BrowserWindow({width: 1072, height: 603});
    window.setMenuBarVisibility(false);
    setTimeout(function(){
        window.loadFile("frontend/loading.html");
    }, 2000);
    console.log('Starting Server');
    //Start Python Dev Server
    backendProc = require("child_process").spawn("python", ['backend.py']);
    waitForBackend();
    // window.loadFile("frontend/index.html");
};

const waitForBackend = function(){
    request(backend).then((response)=>{
        console.log("Server Started. Returned %o", response);
        window.loadFile("frontend/index.html");
    })              .catch((err)=>{
        console.log("Failed. Trying Again. Error: %o", err);
        setTimeout(waitForBackend, 5000);
    });
};


app.on('ready', initWindow);
app.on('window-all-closed', ()=>{
    app.quit();
    backendProc.kill('SIGINT');
});
electron.app.on('browser-window-created',(e,window) => {
    window.setMenu(null);
});
app.on('activate', ()=>{
    if(win == null) initWindow();
});

