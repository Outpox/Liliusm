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
var selectedDisk;
var inputFile = $("#inputFile");
var filePath = $("#filePath");
var fileTypeErrorEl = $("#fileTypeError"), fileTypeError = false;
var fileSizeErrorEl = $("#fileSizeError"), fileSizeError = false;
var file;
var validFile = false;
selectList.material_select();
$('.modal-trigger').leanModal();

//Functions
function updateDrivesList() {
    //console.info('Retrieving drives list');
    diskList = ipcRenderer.sendSync('drives-list');
    //console.log(diskList);
    selectList.empty();
    //selectList.append("<option value='none' disabled selected>" + i18n.__('optionNoSelection') + "</option>");
    diskList.forEach(function (drive, i) {
        var option = $("<option class='circle left' value='" + drive.path + "'>" + drive.name + " (" + drive.size + ", " + drive.path + ")</option>");
        if (i == 0) {
            option.prop('selected', 'true');
        }
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

function findDiskByPath(path) {
    var d = undefined;
    diskList.forEach(function (disk) {
        console.log(disk);
        if (disk.path === path) {
            d = disk;
        }
    });
    return d;
}

//Event listeners
$('#startInstall').on('click', function () {
    selectedDisk = findDiskByPath(selectList.val());
    if (selectedDisk !== undefined) {
        //[...]
    }
});

//Launch app
if (!localStorage.getItem('lang')) {
    localStorage.setItem('lang', navigator.language);
}
translate(localStorage.getItem('lang'));
updateDrivesList();