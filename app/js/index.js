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
var selectList = $("#drivesList");
selectList.material_select();

//Functions
function updateDrivesList() {
    console.info('Retrieving drives list');
    var list = ipcRenderer.sendSync('drives-list');
    console.log(list);
    selectList.empty();
    list.forEach(function (drive) {
        selectList.append("<option class='text-black' value='" + drive.path + "'>" + drive.name + " (" + drive.size + ", " + drive.path + ")</option>");
    });
    selectList.material_select();
}

function translate(lang) {
    i18n.setLocale(lang);
    $('[data-resource]').each(function() {
        var el = $(this);
        var resourceName = el.data('resource');
        var resourceText = i18n.__(resourceName);
        el.text(resourceText);
    });
}

//Launch app
translate(navigator.language);
updateDrivesList();