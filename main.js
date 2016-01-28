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
    mainWindow = new BrowserWindow({width: 600, height: 700, resizable: false});

    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', function () {
    createWindow();

    ipcMain.on('drives-list', function (event, arg) {
        switch (process.platform) {
            case 'win32':
                getDrivesInfosWindows(function (list) {
                    event.returnValue = list;
                });
                break;
            case 'darwin':
                getDrivesInfos(function (list) {
                    event.returnValue = list;
                });
                break;
            default:
                getDrivesInfosWindows(function (list) {
                    event.returnValue = list;
                });
                break;
        }
    });
    ipcMain.on('formatKey', function (event, arg) {
        switch (process.platform) {
            case 'darwin':
                formatKey(arg, function(result) {
                    event.returnValue = result;
                });
                break;
        }
    })
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

function formatKey(disk, callback) {
//diskutil partitionDisk disk3 MBR MS-DOS TEST 0b
    console.log(disk.path);
    callback('ok');
}

/**
 * Retrieves information from disk by using their name.
 * It had to be separated because the disk list name array can be shorter than the actual disk list information array
 * @param callback {Array} - An array containing the disks list.
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
                                    //If size is greater than 64Gb it's most likely a hard drive.
                                    //TODO Improve disk type detection
                                    var type = (diskSize > 64000000000) ? 'hdd' : 'usb';
                                    disks.push({'name': diskName, 'path': diskPath, 'size': size, 'realSize': diskSize, 'type': type});

                                    if (list.length == disks.length) {
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
 * @param callback {Array} - The disks list
 */
function getDrivesInfosWindows(callback) {
    var drives = [
        {
            'name': 'Sans titre',
            'path': 'disk1',
            'size': '236 GiB',
            'realSize': '250000000000',
            'type': 'hdd'
        },
        {
            'name': 'COINCOIN',
            'path': 'disk4',
            'size': '15.6 GiB',
            'realSize': '16000000000',
            'type': 'usb'
        },
        {
            'name': 'Small space',
            'path': 'disk5',
            'size': '1 GiB',
            'realSize': '1000000000',
            'type': 'usb'
        }
    ];
    callback(drives);
}