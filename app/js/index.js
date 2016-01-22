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
var fileTypeErrorEl = $("#fileTypeError"), fileTypeError = false;
var fileSizeErrorEl = $("#fileSizeError"), fileSizeError = false;
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



//Launch app
translate(navigator.language);
updateDrivesList();