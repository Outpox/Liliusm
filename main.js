'use strict';

const electron = require('electron');
const exec = require('child_process').exec;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({width: 600, height: 800});

    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', function () {
    createWindow();
    getDrivesList();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

function getDrivesList() {
//  Command to get all connected drives
//  diskutil list
    exec('diskutil list', function (error, stdout, stderr) {
        if (error == null) {
            if (stderr.length == 0) {
                var regex = /\/[a-z]+\/[a-z]+[0-9]+\ \(external, physical\)/;
            }
            else {
                console.log("err " + stderr.length);
            }
        } else {
            console.log(error);
        }
    })
}