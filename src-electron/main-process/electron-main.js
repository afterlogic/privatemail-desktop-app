import { app, BrowserWindow, ipcMain } from 'electron'

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1550,
    height: 600,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

const sqlite3 = require('sqlite3').verbose()
let db = new sqlite3.Database('privatemail.db', (err) => {
  if (err === null) {
    db.serialize(function() {
      db.run('CREATE TABLE IF NOT EXISTS folders (acct_id INTEGER, list TEXT)')
      db.run('CREATE TABLE IF NOT EXISTS messages_info (acct_id INTEGER, folder_full_name TEXT, messages_info TEXT)')
      db.close()
    })
  }
})

ipcMain.on('bd-get-folders', (event, arg) => {
  let db = new sqlite3.Database('privatemail.db', (err) => {
    if (err) {
      event.sender.send('notification', {event: 'bd-get-folders', err})
    } else {
      db.serialize(function() {
        let stmt = db.prepare('SELECT list FROM folders WHERE acct_id = ?');
        stmt.each(arg, function(err, row) {
          if (row && typeof row.list === 'string' && row.list !== '') {
            event.sender.send('bd-get-folders', JSON.parse(row.list))
          } else {
            event.sender.send('notification', {event: 'bd-get-folders', err, row})
          }
        }, function(err, count) {
            stmt.finalize()
        })

        db.close((err) => {
          if (err) {
            event.sender.send('notification', {event: 'bd-get-folders', err})
          }
        })
      })

    }
  })
})

ipcMain.on('bd-set-folders', (event, arg) => {
  let db = new sqlite3.Database('privatemail.db', (err) => {
    if (err === null) {
      db.serialize(function() {

        let stmt = db.prepare('DELETE FROM folders WHERE acct_id = ?', arg.AccountId)
        stmt.run()
        stmt.finalize()

        stmt = db.prepare('INSERT INTO folders (acct_id, list) VALUES (?, ?)', arg.AccountId, JSON.stringify(arg.FolderList))
        stmt.run()
        stmt.finalize()

        db.close()
      })
    }
  })
})

ipcMain.on('bd-get-messages-info', (event, arg) => {
  let db = new sqlite3.Database('privatemail.db', (err) => {
    if (err) {
      event.sender.send('notification', {event: 'bd-get-messages-info', err})
    } else {
      db.serialize(function() {
        let stmt = db.prepare('SELECT messages_info FROM messages_info WHERE acct_id = ? AND folder_full_name = ?');
        stmt.each(arg.AccountId, arg.FolderFullName, function(err, row) {
          if (row && typeof row.messages_info === 'string' && row.messages_info !== '') {
            event.sender.send('bd-get-messages-info', JSON.parse(row.messages_info))
          } else {
            event.sender.send('notification', {event: 'bd-get-messages-info', err, row})
          }
        }, function(err, count) {
            stmt.finalize()
        })

        db.close((err) => {
          if (err) {
            event.sender.send('notification', {event: 'bd-get-messages-info', err})
          }
        })
      })

    }
  })
})

ipcMain.on('bd-set-messages-info', (event, arg) => {
  let db = new sqlite3.Database('privatemail.db', (err) => {
    if (err === null) {
      db.serialize(function() {

        let stmt = db.prepare('DELETE FROM messages_info WHERE acct_id = ? AND folder_full_name = ?', arg.AccountId, arg.FolderFullName)
        stmt.run()
        stmt.finalize()

        stmt = db.prepare('INSERT INTO messages_info (acct_id, folder_full_name, messages_info) VALUES (?, ?, ?)', arg.AccountId, arg.FolderFullName, JSON.stringify(arg.MessagesInfo))
        stmt.run()
        stmt.finalize()

        db.close()
      })
    }
  })
})
