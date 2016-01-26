const remote = require('electron').remote;
const Menu = remote.Menu;

var template = [
    {
        label: 'Language',
        submenu: []
    },
    {
        label: i18n.__('optionsMenu'),
        submenu: [
            {
                label: i18n.__('unlockHardDrive'),
                click: function () {
                    unlockHardDrive();
                },
                'type': 'checkbox',
                'checked': unlockedHardDrive
            }
        ]
    }
];

/**
 * i18n.getCatalog() returns a list of lang loaded from the files in ../locales
 * So for each existing file lang an option is added to the menu.
 * In order for the menu to be translated, the app has to be restarded (Chrome limitation)
 */
Object.keys(i18n.getCatalog()).forEach(function (lang) {
    template[0].submenu.push({
        click: function () {
            translate(lang);
            template[1].submenu[0].label = i18n.__('unlockHardDrive');
            localStorage.setItem('lang', lang);
            //console.log(template[1].submenu[0].label = i18n.__('unlockHardDrive'));
        },
        'label': i18n.__({phrase: 'lang', locale: lang}),
        'type': 'radio',
        'checked': lang === i18n.getLocale()
    });
});

if (process.platform == 'darwin') {
    //var name = require('electron').app.getName();
    var name = "Liliusm";
    template.unshift({
        label: name,
        submenu: [
            {
                label: 'About ' + name,
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                label: 'Services',
                role: 'services',
                submenu: []
            },
            {
                type: 'separator'
            },
            {
                label: 'Hide ' + name,
                accelerator: 'Command+H',
                role: 'hide'
            },
            {
                label: 'Hide Others',
                accelerator: 'Command+Shift+H',
                role: 'hideothers'
            },
            {
                label: 'Show All',
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: function () {
                    app.quit();
                }
            }
        ]
    });
}

var menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);