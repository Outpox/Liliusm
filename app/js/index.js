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
var noSelectedFileErrorEl = $("#noSelectedFileError"), noSelectedFileError = true;
var noSelectedDiskErrorEl = $("#noSelectedDiskError"), noSelectedDiskError = true;
var fileTypeErrorEl = $("#fileTypeError"), fileTypeError = false;
var fileSizeErrorEl = $("#fileSizeError"), fileSizeError = false;
var file;
var validFile = false;
selectList.material_select();

//Functions
/**
 * Retrieves the disk list from the backend and fill the <select>
 */
function updateDrivesList() {
    fileSizeErrorEl.hide();
    if (!fileTypeError) {
        filePath[0].className = 'file-path validate';
    }
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

/**
 * Translate the app in the given lang. i18n automatically fallback to the default lang if the parameters doesn't match anything.
 * In order to translate the menu the app has to be restarted, this is due to a Chrome limitation...
 * @param lang {string} - 2 chars format : en, fr ...
 */
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
 * Return the disk information matching the given path
 * @param path {string}
 * @returns {object} - The disk object or undefined
 */
function findDiskByPath(path) {
    var d = undefined;
    diskList.forEach(function (disk) {
        if (disk.path === path) {
            d = disk;
        }
    });
    return d;
}

/**
 * Return true if there is no error.
 * @returns {boolean}
 */
function noError() {
    noSelectedDiskErrorHandle();
    noSelectedFileErrorHandle();
    if (!noSelectedFileError) {
        verifyFileSize();
        verifyFileType();
        return (!fileTypeError && !fileSizeError);
    }
    else {
        return false;
    }
}

//Event listeners
$('#startInstall').on('click', function () {
    if (noError()) {
        selectedDisk = findDiskByPath(selectList.val());
        if (selectedDisk !== undefined) {
            formatModal();
        }
    }
    else {
        $("#errorModal").openModal({dismissible: false});
    }
});

$("#errorModalBtn").on('click', function () {
    $("#errorModal").closeModal();
});

$("#errorModalBtnForce").on('click', function () {
    $("#errorModal").closeModal();
    formatModal();
});

function formatModal() {
    $("#formatModal").openModal({dismissible: false});
}

$("#formatModalBtn").on('click', function () {
    var ret = ipcRenderer.sendSync('formatKey', selectedDisk);
    console.log(ret);
});

//Launch app
if (!localStorage.getItem('lang')) {
    localStorage.setItem('lang', navigator.language);
}
translate(localStorage.getItem('lang'));
updateDrivesList();