var online = {} 

function MakeOnline(user, socketid) { 
    online[user] = socketid
}

function MakeOfflineByUserID(user) {
    delete online[user]
}

function MakeOfflineBySocketID(socketID) {
    for (let key in online) {
        if (online[key] === socketID) {
            MakeOfflineByUserID(key)
            return
        }
    }
}

function isOnline(user) {
    return online.hasOwnProperty(user)
}

function isOffline(user) {
    return !online.hasOwnProperty(user)
}

module.exports = { 
    online,
    MakeOfflineByUserID,
    MakeOfflineBySocketID, 
    MakeOnline, 
    isOffline,
    isOnline
 };