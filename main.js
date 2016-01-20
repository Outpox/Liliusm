'use strict';

const electron = require('electron');
const exec = require('child_process').exec;
const parseString = require('xml2js').parseString;
const filesize = require('file-size');
const ipcMain = require('electron').ipcMain;
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

    ipcMain.on('drives-list', function(event, arg) {
        getDrivesInfosWindows(function (list) {
            event.returnValue = list;
        })
    });

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

/**
 * Retrieves the disk name of all connected drives
 * @param callback - Array of disk name
 */
function getDrivesNames(callback) {
//  Command to get all connected drives names
    exec('diskutil list -plist', function (error, stdout, stderr) {
        if (error == null) {
            if (stderr.length == 0) {
                parseString(stdout, function (err, result) {
                    if (err == null) {
                        var diskNames = result.plist.dict[0].array[2].string;
                        callback(diskNames);
                    } else {
                        console.log(err);
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

/**
 * Retrieves information from disk by using their name.
 * It had to be separated because the disk list name array can be shorter than the actual disk list information array
 * @param callback - Array
 */
function getDrivesInfos(callback) {
//  Command to get all connected drives
    var disks = [];
    getDrivesNames(function (list) {
        if (list.length > 0) {
            list.forEach(function (diskName, i) {
                //We need to push a backslash before spaces
                var parsedName = diskName.replace(new RegExp(" ", 'g'), "\\ ");
                exec('diskutil list -plist ' + parsedName, function (error, stdout, stderr) {
                    if (error == null) {
                        if (stderr.length == 0) {
                            parseString(stdout, function (err, result) {
                                if (err == null) {
                                    var diskSize = parseInt(result.plist.dict[0].array[1].dict[0].integer[0]);
                                    var diskPath = result.plist.dict[0].array[3].string[0];
                                    var size = filesize(diskSize).human();
                                    disks.push({'name': diskName, 'path': diskPath, 'size': size});

                                    if (i == list.length - 1) {
                                        callback(disks);
                                    }
                                } else {
                                    console.log(err);
                                }
                            });
                        }
                        else {
                            console.log(stderr);
                        }
                    } else {
                        console.log(error);
                    }
                });
            });
        }
    });
}

/**
 * Simulate getDrivesInfos() when developing on Windows
 * @param callback
 */
function getDrivesInfosWindows(callback) {
    var drives = [
        {
            'name': 'Sans titre',
            'path': 'disk1',
            'size': '236 GiB'
        },
        {
            'name': 'COINCOIN',
            'path': 'disk4',
            'size': '15.6 GiB'
        }
    ];
    callback(drives);
}