var online = {} 

function MakeOnline(user, socketid) { 
    online[user] = socketid
}

function MakeOfflineByUserID(user) {
    delete online[user]
}

// clear online user and return that userid
function MakeOfflineBySocketID(socketID) {
    for (let key in online) {
        if (online[key] === socketID) {
            MakeOfflineByUserID(key)
            return key
        }
    }
}

function isOnline(user) {
    return online.hasOwnProperty(user)
}

function isOffline(user) {
    return !online.hasOwnProperty(user)
}

function socketIdOf(id) {
    return online[id]
}

function isEmpty() {
    return Object.keys(online).length === 0
}

module.exports = { 
    online,
    MakeOfflineByUserID,
    MakeOfflineBySocketID, 
    MakeOnline, 
    isOffline,
    isOnline,
    socketIdOf, 
    isEmpty
 };