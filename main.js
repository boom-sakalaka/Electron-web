/*
 * @Author: GZH
 * @Date: 2021-07-19 11:27:29
 * @LastEditors: GZH
 * @LastEditTime: 2021-07-20 16:06:41
 * @FilePath: \my-electron-app10.4\main.js
 * @Description:
 */
// main.js
const { app, BrowserWindow, shell, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const prompt = require('electron-prompt');

var pepflashplayer = '';
var infoFile_path = path.join(__dirname, 'lib/info.json').replace(/\\/g, '/');
//目前只支持windows
if (process.platform == 'win32') {
  if (process.arch == 'x64') {
    pepflashplayer = path.join(__dirname, 'lib/pepflashplayer64_28_0_0_126.dll');
    if (__dirname.includes('.asar')) {
      pepflashplayer = path.join(process.resourcesPath + '/lib/pepflashplayer64_28_0_0_126.dll');
      infoFile_path = path.join(process.resourcesPath + '/lib/info.json').replace(/\\/g, '/');
    }
  } else {
    pepflashplayer = path.join(__dirname, 'lib/pepflashplayer32_28_0_0_126.dll');
    if (__dirname.includes('.asar')) {
      pepflashplayer = path.join(process.resourcesPath + '/lib/pepflashplayer32_28_0_0_126.dll');
      infoFile_path = path.join(process.resourcesPath + '/lib/info.json').replace(/\\/g, '/');
    }
  }
}

app.commandLine.appendSwitch('ppapi-flash-path', pepflashplayer);
app.commandLine.appendSwitch('ppapi-flash-version', '28_0_0_126');

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win;
let setSysUrl = 'https://www.baidu.com';
const autoUpdater = require('electron-updater').autoUpdater; //引入 autoUpdater

//自定义菜单
let template = [
  {
    label: '编辑',
    submenu: [
      {
        label: '撤销',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo',
      },
      {
        label: '重做',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: '剪切',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
      },
      {
        label: '复制',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
      },
      {
        label: '粘贴',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
      {
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall',
      },
    ],
  },
  {
    label: '查看',
    submenu: [
      {
        label: '刷新',
        accelerator: 'CmdOrCtrl+R',
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            // 重载之后, 刷新并关闭所有的次要窗体
            if (focusedWindow.id === 1) {
              BrowserWindow.getAllWindows().forEach(function (win) {
                if (win.id > 1) {
                  win.close();
                }
              });
            }
            focusedWindow.reload();
          }
        },
      },
      {
        label: '切换全屏',
        accelerator: (function () {
          if (process.platform === 'darwin') {
            return 'Ctrl+Command+F';
          } else {
            return 'F11';
          }
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
      },
      {
        label: '切换开发者工具',
        accelerator: (function () {
          if (process.platform === 'darwin') {
            return 'Alt+Command+I';
          } else {
            return 'Ctrl+Shift+I';
          }
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.toggleDevTools();
          }
        },
      },
      {
        label: '应用程序菜单演示',
        visible: false,
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            const options = {
              type: 'info',
              title: '应用程序菜单演示',
              buttons: ['好的'],
              message: '此演示用于 "菜单" 部分, 展示如何在应用程序菜单中创建可点击的菜单项.',
            };
            dialog.showMessageBox(focusedWindow, options, function () {});
          }
        },
      },
    ],
  },
  {
    label: '窗口',
    role: 'window',
    submenu: [
      {
        label: '最小化',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize',
      },
      {
        label: '关闭',
        accelerator: 'CmdOrCtrl+W',
        role: 'close',
      },
    ],
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [
      {
        label: '系统配置',
        click: function () {
          promptShow(setSysUrl);
        },
      },
      {
        label: '官方网站',
        click: function () {
          shell.openExternal('https://www.myProj.com');
        },
      },
    ],
  },
];

if (process.platform == 'win32') {
  const helpMenu = template[template.length - 1].submenu;
  addUpdateMenuItems(helpMenu, 0);
}

function promptShow(setSysUrl, result) {
  let ororok = true;
  if (result == undefined) {
    ororok = false;
    result = JSON.parse(fs.readFileSync(infoFile_path, 'utf-8'));
    if (result['website'] != undefined) {
      setSysUrl = result['website']; //系统地址
    }
  }
  prompt({
    title: '系统配置',
    menuBarVisible: false,
    skipTaskbar: false,
    alwaysOnTop: true,
    label: '系统外网地址:',
    value: setSysUrl,
    buttonLabels: { ok: '确 定', cancel: '取 消' },
    width: 500,
    height: 200,
    inputAttrs: {
      type: 'url',
    },
    type: 'input',
  })
    .then(r => {
      if (r === null && ororok == true) {
        const options = {
          type: 'error',
          title: '错误提示',
          buttons: ['好的'],
          message: '无法启动系统，系统配置必须设置并提交.',
        };
        let setre = dialog.showMessageBoxSync(win, options);
        if (setre == 0) {
          app.quit();
        }
      } else if (r === null && ororok == false) {
        //createWindow();
      } else {
        if (setSysUrl != r) {
          result['website'] = r;
          result['editor'] = true;
          var data = fs.writeFileSync(infoFile_path, JSON.stringify(result));
          //createWindow();
          const options = {
            type: 'info',
            title: '重启提示',
            buttons: ['好的'],
            message: '系统地址已改变，请重新启动系统.',
          };
          let setre = dialog.showMessageBoxSync(win, options);
          if (setre == 0) {
            app.quit();
            app.relaunch();
          }
        }
      }
    })
    .catch(console.error);
  return true;
}

function addUpdateMenuItems(items, position) {
  if (process.mas) return;

  const version = app.getVersion();
  let updateItems = [
    {
      label: `Version ${version}`,
      enabled: false,
    },
    {
      label: '检查更新',
      key: 'checkForUpdate',
      click: function () {
        autoUpdater.checkForUpdates();
      },
    },
    {
      label: '重启并安装更新',
      enabled: true,
      visible: false,
      key: 'restartToUpdate',
      click: function () {
        autoUpdater.quitAndInstall();
      },
    },
  ];

  items.splice.apply(items, [position, 0].concat(updateItems));
}

/* function findReopenMenuItem() {
  const menu = Menu.getApplicationMenu();
  if (!menu) return;

  let reopenMenuItem;
  menu.items.forEach(function (item) {
    if (item.submenu) {
      item.submenu.items.forEach(function (item) {
        if (item.key === 'reopenMenuItem') {
          reopenMenuItem = item;
        }
      });
    }
  });
  return reopenMenuItem;
} */

// 自定义菜单
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

function createWindow() {
  // 创建浏览器窗口。
  win = new BrowserWindow({
    width: 1024,
    height: 800,
    frame: true,
    //show: false,
    backgroundColor: '#e3e9f0',
    webPreferences: {
      plugins: true,
      nodeIntegration: true,
      nativeWindowOpen: true,
      webviewTag: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  let result = {};
  let getfor = fs.existsSync(infoFile_path);
  let editor = true;
  if (getfor == true) {
    result = JSON.parse(fs.readFileSync(infoFile_path, 'utf-8'));
    if (result['website'] != undefined) {
      setSysUrl = result['website']; //系统地址
      editor = result['editor'];
    }
  } else {
    const options = {
      type: 'error',
      title: '配置文件错误提示',
      buttons: ['好的'],
      message: '配置文件不存在，将使用默认系统地址.',
    };
    dialog.showMessageBox(win, options, function () {});
    //console.log("配置文件不存在");
  }

  if (editor != true) {
    promptShow(setSysUrl, result);
  } else {
    // 加载index.html文件
    win.loadURL(setSysUrl);
    win.webContents.on('did-finish-load', () => {});

    win.webContents.on('will-prevent-unload', event => {
      event.preventDefault();
    });
    // 打开开发者工具
    // win.webContents.openDevTools();

    // 当 window 被关闭，这个事件会被触发。
    win.on('closed', () => {
      // 取消引用 window 对象，如果你的应用支持多窗口的话，
      // 通常会把多个 window 对象存放在一个数组里面，
      // 与此同时，你应该删除相应的元素。
      win = null;
    });
  }

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()
  //自动升级
  autoUpdater.setFeedURL('https://www.myProj.com/update_winapp/');
  autoUpdater.checkForUpdates();
  autoUpdater.on('update-downloaded', function () {
    autoUpdater.quitAndInstall();
  });
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow);

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。

  /*   let reopenMenuItem = findReopenMenuItem();
  if (reopenMenuItem) reopenMenuItem.enabled = false; */
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('browser-window-created', function () {
  /*   let reopenMenuItem = findReopenMenuItem();
  if (reopenMenuItem) reopenMenuItem.enabled = false; */
});

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow();
  }
});
