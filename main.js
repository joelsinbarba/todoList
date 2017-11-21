const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//SET ENV
//process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready', function(){
    //Create new window
    mainWindow = new BrowserWindow({});
    //Load html into window
    mainWindow.loadURL(url.format({
        pathname : path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes : true
    }));
    
    //Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });
    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});

//Handel create add window
function createAddWindow(){
    //Create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 140,
        title : 'Add Item'
    });
    addWindow.setMenu(null);
    //Load html into window
    addWindow.loadURL(url.format({
        pathname : path.join(__dirname, 'addWindow.html'),
        protocol: 'file',
        slashes : true
    }));
    //Garbage collection handle
    addWindow.on('close',function(){
        addWindow = null;
    })
}

// Catch item:add
ipcMain.on('item:add', function(e,item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});


//Create menu template
const mainMenuTemplate = [
    {
        label : 'File',
        submenu : [
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                },
                accelerator : process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N'    
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label: 'Quit',
                click(){
                    app.quit();
                },
                accelerator : process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q'
            }
        ]
    }
];

//If mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

//Add developer tools if not in prod
if(process.env.NODE_ENV != 'production'){
    mainMenuTemplate.push({
        label: 'Dev',
        submenu : [
            {
                label: 'Toggle Dev Tools',
                click(item,focusedWindow){
                    focusedWindow.toggleDevTools();
                },
                accelerator : process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I'                
            },
            {
                role: 'reload'
            }
        ]
    });
}