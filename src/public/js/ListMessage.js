console.log("linked!!!!")

export var queue = {}

export function PushMessage(mess) {
    let name = mess.from 
    if (name in queue) {
        queue[name].push(mess)
    }
    else {
        queue[name] = [mess]
    }
}

export function CleanMessageById(id_user) {
    queue[id_user] = []
}
