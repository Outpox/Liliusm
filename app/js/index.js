//Constants
const ipcRenderer = require('electron').ipcRenderer;
const i18n = require('i18n');

//Initial configuration
i18n.configure({
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    directory: 'app/locales/'
});

//Initialization
var unlockedHardDrive = false;
var selectList = $("#drivesList");
var diskList = [];
var selectedDisk = {};
var inputFile = $("#inputFile");
var filePath = $("#filePath");
var fileTypeError = $("#fileTypeError");
var fileSizeError = $("#fileSizeError");
var file;
var validFile = false;
selectList.material_select();

//Functions
function updateDrivesList() {
    console.info('Retrieving drives list');
    diskList = ipcRenderer.sendSync('drives-list');
    console.log(diskList);
    selectList.empty();
    diskList.forEach(function (drive) {
        var option = $("<option class='circle left' value='" + drive.path + "'>" + drive.name + " (" + drive.size + ", " + drive.path + ")</option>");

        if (drive.type == 'hdd') {
            option.attr('data-icon', 'img/harddisk.png');
            if (unlockedHardDrive) {
                if (option.disabled) option.disabled = false;
            }
            else {
                option.prop('disabled', 'true');
            }
        }
        else {
            option.attr('data-icon', 'img/usb.png');
        }
        selectList.append(option);
    });
    selectList.material_select();
}

function translate(lang) {
    i18n.setLocale(lang);
    $('[data-resource]').each(function () {
        var el = $(this);
        var resourceName = el.data('resource');
        var resourceText = i18n.__(resourceName);
        el.text(resourceText);
    });
}

function unlockHardDrive() {
    unlockedHardDrive = !unlockedHardDrive;
    updateDrivesList();
}

/**
 * Awesome function which lets you determine precisely the type of a file
 * Source: http://stackoverflow.com/a/29672957/3560404
 * @param file - File Object | The file we want to check
 * @param callback - Boolean | File type verified or not
 */
function verifyFileType(file, callback) {
    var fileReader = new FileReader();
    fileReader.onloadend = function (e) {
        var arr = (new Uint8Array(e.target.result)).subarray(0, 4);
        var header = "";
        for (var i = 0; i < arr.length; i++) {
            header += arr[i].toString(16);
        }
        //.iso header : 43 44 30 30 31
        //.png header : 89 50 (for testing purposes)
        //.exe header : 4D 5A (for testing purposes)
        //We're looking for the header type at the beginning of the file header so it must return 0
        callback(header.indexOf('8950') == 0 || header.indexOf('4d5a') == 0 || header.indexOf('4344') == 0);
    };
    fileReader.readAsArrayBuffer(file);
}

//Event listeners
selectList.on('change', function (e) {
    console.log();
    diskList.forEach(function (disk) {
        if (selectList.val() == disk.path) {
            selectedDisk = disk;
        }
    })
});

inputFile.on('change', function (e) {
    e.preventDefault();
    if (document.getElementById('inputFile').files[0]) {
        file = document.getElementById('inputFile').files[0];
        console.log(file);
        filePath.val(file.path);
        verifyFileType(file, function (verified) {
            validFile = verified;
            if (validFile) {
                filePath[0].className = 'file-path validate valid';
                fileTypeError.hide();
                if (selectedDisk.realSize < file.size) {
                    fileSizeError.show();
                }
                else {
                    fileSizeError.hide();
                }
            }
            else {
                filePath[0].className = 'file-path validate invalid';
                fileTypeError.show();
            }
        });
    }
    return false;
});

//Launch app
translate(navigator.language);
updateDrivesList();