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
 * Awesome function which lets you determine precisely the type of a file.
 * Tough it doesn't seem to be very efficient with large files.
 * Source: http://stackoverflow.com/a/29672957/3560404
 * @param callback { function } - File type verified or not
 */
function verifyFileTypeByHeader(callback) {
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

/**
 * Verifying the mime type. Tough ISO mime type is not reliable so I added a fallback which verifies the file extension.
 * File extension source: http://stackoverflow.com/a/1203361/3560404
 * @returns { Boolean } - Verified or not
 */
function verifyFileTypeByMime() {
    if (file.type.match(/^(application\/iso-image|application\/octet-stream|application\/octetstream)$/)) {
        return true;
    }
    else {
        var ext = file.name.substr((~-file.name.lastIndexOf(".") >>> 0) + 2);
        return ext.match(/^(iso|exe)$/) !== null;
    }
}

/**
 * Check if the file size isn't bigger than the disk size
 */
function verifyFileSize() {
    if (selectedDisk !== undefined && file !== undefined) {
        if (selectedDisk.realSize < file.size) {
            fileSizeError.show();
        }
        else {
            fileSizeError.hide();
        }
    }
}
/**
 *
 */
function verifyFileType() {
    if (selectedDisk !== undefined && file !== undefined) {
        filePath.val(file.path);
        validFile = verifyFileTypeByMime();
        if (validFile) {
            filePath[0].className = 'file-path validate valid';
            fileTypeError.hide();
        }
        else {
            filePath[0].className = 'file-path validate invalid';
            fileTypeError.show();
        }
    }
}

//Event listeners
selectList.on('change', function (e) {
    diskList.forEach(function (disk) {
        if (selectList.val() == disk.path) {
            selectedDisk = disk;
        }
    });
    verifyFileType();
    verifyFileSize();
});

inputFile.on('change', function (e) {
    e.preventDefault();
    if (document.getElementById('inputFile').files[0]) {
        file = document.getElementById('inputFile').files[0];
        console.log(file);
        verifyFileType();
        verifyFileSize();
    }
    return false;
});

//Launch app
translate(navigator.language);
updateDrivesList();