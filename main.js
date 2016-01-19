'use strict';

const electron = require('electron');
const exec = require('child_process').exec;
const parseString = require('xml2js').parseString;
const filesize = require('file-size');
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
    exec('diskutil list -plist', function (error, stdout, stderr) {
        if (error == null) {
            if (stderr.length == 0) {
                parseString(stdout, function (err, result) {
                    if (err !== null) {
                        console.log(err);
                    } else {
                        var diskSize = result.plist.dict[0].array[1].dict;
                        var diskNames = result.plist.dict[0].array[2].string;
                        var diskPaths = result.plist.dict[0].array[3].string;
                        var disks = [];
                        for (var i = 0; i < diskNames.length; i++) {
                            var size = filesize(parseInt(diskSize[i].integer[0])).human();
                            disks.push({'name': diskNames[i], 'path': diskPaths[i], 'size': size});
                        }
                        console.log(disks);
                    }
                });
            }
            else {
                console.log(stderr);
            }
        } else {
            console.log(error);
        }
    })
}