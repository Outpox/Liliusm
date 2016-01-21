const remote = require('electron').remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

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
                }
            }
        ]
    }
];

var langObject = [];
Object.keys(i18n.getCatalog()).forEach(function (lang) {
    template[0].submenu.push({
        click: function () {
            translate(lang);
        },
        'label': i18n.__({phrase: 'lang', locale: lang})
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