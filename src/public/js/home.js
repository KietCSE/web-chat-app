//create socket
const PORT = "http://localhost:3000"

export const socket = io(PORT);
const inputMess = document.querySelector('.chat-input .mainInput');    //input chat 
const chatbox = document.querySelector('.chatbox')   // screen chat
const listBlockChat = document.querySelectorAll('.blockchat')         // list friend 

var USER = sessionStorage.getItem('user')   // id of user 
export var CHATING_USER_ID       // id of user you are chating 
var CHATING_CONVER_ID   // id of convesation you are chating 
var MGS_SLICE = 0        // id slice of conversation loading 
var FRD_SLICE = 0
export var FILE_UP_LOAD     // file is sending 
var FIND_FRD_HTML = document.querySelector('.list-friend').innerHTML

// set number order for all friend
// in order to arrange friend 
export var PIVOT = 1   // pivot for order list friend 
listBlockChat.forEach((element) => {
    element.setAttribute('number', 0)
})

//load user name and avatar 
const USERNAME = sessionStorage.getItem('username')
const AVATAR = sessionStorage.getItem('avatar')
document.getElementById('user-name').innerText = USERNAME
document.getElementById('user-avatar').src = AVATAR


// create message time
function getTime() {
    const now = new Date() 
    const hours = now.getHours()
    const minutes = now.getMinutes()
    return `${hours}:${minutes}`
} 

//create message format 
function createMessage(mess, image = null, file = null) {
    return {
        'from'      : USER, 
        'to'        : CHATING_USER_ID,
        'conver'    : CHATING_CONVER_ID, 
        'content'   : mess, 
        'time'      : getTime(),
        'image'     : image, 
        'file'      : file
    }
}

// scroll 
export function scrollDown() {
    chatbox.scrollTop = chatbox.scrollHeight
}
scrollDown()


//make user online 
export async function UpdateOnlineUser() {
    try {
        var data = {
            userID: USER, 
            socketID : socket.id
        };

        let response = await fetch(`${PORT}/load-online`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!response.ok) throw new Error('Network response was not ok ' + response.statusText)

        let jsonResponse = await response.json()
        console.log('update online successfully')

        // update online user 
        if (jsonResponse.status) {
            let listOnlineFriend = jsonResponse.data
            listBlockChat.forEach(element => {
                if (element.getAttribute('key') in listOnlineFriend) {
                    element.querySelector('.online').style.visibility = 'visible'
                }
            })
        }
    } catch (err) {
        console.error('Error:', err);
    }
}


//CLICK ON PEOPLE TO CHAT ------

// load conversation content for slice = 0 
function LoadConversation(mess) {
    mess.forEach(e => { loadNewFriendMessage(e) })  
    scrollDown()
} 


// load conversation content for slice > 0
function LoadHeadConversation(mess) {
    for (let i = mess.length-1; i >= 0; i--) {
        loadNewFriendMessage(mess[i], true)
    }
} 


// load message of new friend from database and insert into chat box 
// mess : message object from database 
// head : type of insert, head=true insert on the top of conversation, head=false insert at the bottom 
export function loadNewFriendMessage(mess, head=false) {
    if (mess.image) {
        const newMessage = document.createElement('div')
        if (mess.from === USER) 
            newMessage.classList.add('mess', 'my-message')
        else 
            newMessage.classList.add('mess', 'frnd-message')
        const content = document.createElement('p')
        const picture = document.createElement('img')
        const time = document.createElement('span') 
        time.innerText = mess.time
        picture.src = mess.image
        picture.style.maxWidth = "400px"
        content.appendChild(picture)
        content.appendChild(time)
        newMessage.appendChild(content)
        //insert into chat box 
        if (!head) chatbox.appendChild(newMessage)
        else chatbox.insertBefore(newMessage, chatbox.firstChild)
    }
    else if (mess.file) {
        const newMessage = document.createElement('div')
        if (mess.from === USER) 
            newMessage.classList.add('mess', 'my-message')
        else 
            newMessage.classList.add('mess', 'frnd-message')
        const url = document.createElement('a')
        url.href = mess.file
        url.innerText = mess.content
        const time = document.createElement('span') 
        time.innerText = mess.time
        const content = document.createElement('p')
        content.appendChild(url)
        content.appendChild(time)
        newMessage.appendChild(content)
        //insert into chat box 
        if (!head) chatbox.appendChild(newMessage)
        else chatbox.insertBefore(newMessage, chatbox.firstChild)
    }
    else {
        const newMessage = document.createElement('div')
        if (mess.from === USER) 
            newMessage.classList.add('mess', 'my-message')
        else 
            newMessage.classList.add('mess', 'frnd-message')
        const content = document.createElement('p')
        content.innerHTML = `${mess.content} <br><span>${mess.time}</span>`
        newMessage.appendChild(content)
        //insert into chat box 
        if (!head) chatbox.appendChild(newMessage)
        else chatbox.insertBefore(newMessage, chatbox.firstChild)
    }
}


// load additional coversation content when scolling 
chatbox.addEventListener('scroll', async () => {
    if (chatbox.scrollTop === 0) {
        try {
            // check if there are no slice left 
            if (MGS_SLICE === undefined) return 
            // fetch content 
            let response = await fetch(`${PORT}/chat/${CHATING_CONVER_ID}/${++MGS_SLICE}`)
            if (!response.ok) throw Error("Error when load conversation data")
            let jsonResponse = await response.json()
            console.log(jsonResponse)
            // if there are no content 
            if (jsonResponse.length === 0) {
                MGS_SLICE = undefined
                return  
            }
            LoadHeadConversation(jsonResponse)
        } catch(err) {
            console.log(err)
        }
    }
})


// active user are chating 
// input e = blockchat 
export function ActiveUser(e) {
    //if already active user
    if (e.classList.contains('active')) return 

    //change name of chating user 
    let chatingName = e.querySelector('h4').textContent
    document.getElementById('chating-name').innerText = chatingName

    //change avatar of chating user load online icon
    let avatar = e.querySelector('img').src
    document.getElementById('chating-avatar').src = avatar
    const isonline = e.querySelector('.imgchat .online')
    if (isonline && isonline.style.visibility === 'visible') {
        document.querySelector('.imgText .imgchat .online').style.visibility = 'visible'
    }
    else document.querySelector('.imgText .imgchat .online').style.visibility = 'hidden '


    //else active new user 
    document.querySelectorAll('.blockchat').forEach(element => {
        element.classList.remove('active')
    })
    e.classList.add('active')
    //update chating-user
    CHATING_USER_ID = e.getAttribute('key')
    CHATING_CONVER_ID = e.id
    MGS_SLICE = 0

    //delete current chat 
    chatbox.textContent = ''

    //delete notify: remove b and remove fontweight
    let nofity = e.querySelector('b')
    if (nofity) nofity.remove()
    e.querySelector('.message p').style.removeProperty('font-weight');

    // fetch API to collect message from database 
    fetch(`${PORT}/chat/${e.id}/0`)
    .then(respone => respone.json())
    .then(res => {
        LoadConversation(res)
        scrollDown()
    })
    .catch(err => {
        //  ERROR
    })
}

// set active function to all blockchat
document.querySelectorAll('.blockchat').forEach(e => {
    e.addEventListener('click', () => ActiveUser(e))
})


// CLICK MAKE NEW FRIEND 
const newfriend = document.querySelector('.search-chat button')
const listpeople = document.querySelector('.find-friend')
const morefriend = document.querySelector('.list-friend .more-friend')

//click on new friend button
newfriend.addEventListener('click', () => {
    if (FIND_FRD_HTML) {
        document.querySelector('.list-friend').innerHTML = FIND_FRD_HTML
        AddEventToCreateNewFriend()
    }
    listpeople.style.visibility = 'visible';

    // morefriend.addEventListener('click', () => {console.log(1)})

    document.addEventListener('click', async (event) => {
        if (event.target == document.querySelector('.list-friend .more-friend')) {
            const response = await fetch(`${PORT}/more-friend/${USER}/${++FRD_SLICE}`)
            if (!response.ok) return Error("Error when load new friend")
            const data = await response.json()
            LoadSearchedFriend(data)
            AddEventToCreateNewFriend()
        }

        if (!listpeople.contains(event.target) && event.target !== newfriend) {
            listpeople.style.visibility = 'hidden';
        }
    });

});


function AddEventToCreateNewFriend() {
    //ADD NEW BOX CHAT OF NEW FRIEND 
    document.querySelectorAll('.list-friend .friend-box button').forEach(e => {
        e.addEventListener('click', (event) => {

            //close if new friend already active 
            if (CHATING_USER_ID === e.parentElement.getAttribute('key')) return 

            //close friend list 
            listpeople.style.visibility = 'hidden';

            // name of new friend 
            let NameOfNewFriend =  e.parentElement.querySelector('span').textContent 
            // key of newfriend 
            let NewKeyFriend = e.parentElement.getAttribute('key')
            //avatar of new friend
            let NewAvatar = e.parentElement.querySelector('img').src

            //create new box chat for new friend 
            let newDiv = document.createElement('div')
            newDiv.classList.add('blockchat');
            newDiv.setAttribute('key', NewKeyFriend);  
            newDiv.setAttribute('id', USER + NewKeyFriend);

            newDiv.innerHTML = `
                    <div class="imgchat">
                        <img src="${NewAvatar}" alt="" class="cover">
                        <div class="online"></div>
                    </div>
                    
                    <div class="details">
                        <div class="listHead">
                            <h4>${NameOfNewFriend}</h4>
                            <h5 class="newfriend">New Friend</h5>
                            <p class="time"></p>
                        </div>
                        <div class="message">
                            <p></p>
                        </div>
                    </div>`

            //add active event listener
            newDiv.addEventListener('click', () => ActiveUser(newDiv))

            // insert friend box to front end 
            let list = document.querySelector('.chat-list')
            list.insertBefore(newDiv, list.firstChild)
            
            //auto active new friend chat box 
            document.querySelectorAll('.blockchat').forEach(element => {
                element.classList.remove('active')
            })
            newDiv.classList.add('active')

            //auto change chating user
            document.getElementById('chating-avatar').src = NewAvatar

            //update chating-user
            CHATING_USER_ID = NewKeyFriend
            CHATING_CONVER_ID = USER + NewKeyFriend  // new chat conversation id 

            // clear content
            chatbox.textContent = ''

        })
    }) 
}
AddEventToCreateNewFriend()


function LoadSearchedFriend(data) {
    const NewFriendList = document.querySelector('.list-friend')
    data.forEach(element => {
        const newfriend = document.createElement('div')
        newfriend.classList.add('friend-box')
        newfriend.setAttribute('key', element.key)
        newfriend.innerHTML = `
            <img src="${element.avatar}" alt="">
            <span>${element.name}</span>
        `
        if (element.isFriend) {
            const ob = document.createElement('p')
            ob.innerText = 'YOUR FRIEND'
            newfriend.appendChild(ob)
        }
        else {
            const button = document.createElement('button')
            button.innerText = 'CONNECT'
            newfriend.appendChild(button)
        }

        NewFriendList.insertBefore(newfriend, NewFriendList.lastElementChild)
    })
}

console.log(document.getElementById('more-friend'))

// CLICK [MORE] BUTTON TO LOAD MORE NEW FRIEND 
document.getElementById('more-friend').addEventListener('click', async (event) => {
    event.preventDefault()
    console.log(1)
    const response = await fetch(`${PORT}/more-friend/${USER}/${++FRD_SLICE}`)
    if (!response.ok) return Error("Error when load new friend")
    const data = await response.json()
    LoadSearchedFriend(data)
    AddEventToCreateNewFriend()
})


// SEARCH TO FIND NEW FRIEND 
document.querySelector('.search-new-friend').addEventListener('keydown',  async event => {
    if (event.key !== "Enter") return
    const text = document.querySelector('.search-new-friend').value
    console.log(text)

    const response = await fetch(`${PORT}/user/${USER}/search-friend`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"text" : text })
    })
    if (!response.ok) return Error('Fail to search new friend') 
    const data = await response.json() 

    const NewFriendList = document.querySelector('.list-friend')
    NewFriendList.innerHTML = ''
    LoadSearchedFriend(data)
    AddEventToCreateNewFriend()
 })


// past image or file into the chat input 
inputMess.addEventListener("paste", (event) => {
    const items = event.clipboardData.items
    
    console.log(items)
    for (let i = 0; i < items.length; i++) {
        if (items[i].kind !== 'file') {
            event.preventDefault()
            continue
        }
        const file = items[i].getAsFile()
        console.log("file" , file)
        console.log(items[i].kind, " ", items[i].type)

        if (!file) continue 

        let URLimg
        // if file is image 
        if (items[i].type.startsWith('image/')) {         
            URLimg = URL.createObjectURL(file) 
        }
        // if it's not a iamge 
        else {        
            URLimg = 'https://cdn-icons-png.flaticon.com/512/3155/3155688.png'
        }
        const image = document.createElement('img')
        image.src = URLimg
        image.style.width = "70px"
        // insert into input chat 
        inputMess.appendChild(image)
        FILE_UP_LOAD = file      
    }
})


// send mess to friends 
inputMess.addEventListener('keydown', async event => {

    if (event.key !== "Enter") return 
    event.preventDefault(); // Ngăn chặn hành động mặc định của phím

    // if doesn't have target user to chat 
    if (!CHATING_USER_ID) return 

    let contentMess 
    let currentTime = getTime()
    // if that is a file 
    if (FILE_UP_LOAD) {

        const formdata = new FormData()
        formdata.append("uploadFile", FILE_UP_LOAD)
        
        let response = await fetch(`${PORT}/uploadFile`, {
            method: 'POST',
            body: formdata
        })

        if (!response.ok) return Error("Fail when fetch")
        let {downloadURL} = await response.json()
        console.log(downloadURL)
        //load mess into chat box 
        
        const newMessage = document.createElement('div')
        newMessage.classList.add('mess', 'my-message')
        const content = document.createElement('p')
        const time = document.createElement('span') 
        time.innerText = currentTime

        if (FILE_UP_LOAD.type.startsWith('image')) {
            const picture = document.createElement('img')
            picture.src = downloadURL
            picture.style.maxWidth = "400px"
            content.appendChild(picture)
            content.appendChild(time)
            newMessage.appendChild(content)

            //create message 
            let mess = createMessage("[File]", downloadURL)
            socket.emit("sendMess", mess)  // send mess to friend and save 
        }
        else {
            const url = document.createElement('a')
            url.href = downloadURL
            url.innerText = FILE_UP_LOAD.name
            content.appendChild(url)
            content.appendChild(time)
            newMessage.appendChild(content)

            //create message 
            let mess = createMessage(FILE_UP_LOAD.name, null, downloadURL)
            socket.emit("sendMess", mess)  // send mess to friend and save 
        }
        chatbox.appendChild(newMessage)

        //clear temp variable 
        FILE_UP_LOAD = undefined

        contentMess = "[File]"   // message visulize in friend list 
    }
    else {
        // if that is not a file 
        let mess = createMessage(inputMess.innerText)
        socket.emit("sendMess", mess)

        //load mess into chat box 
        let newMessage = document.createElement('div')
        newMessage.classList.add('mess', 'my-message')
        let content = document.createElement('p')
        content.innerHTML = `${inputMess.innerText} <br><span>${currentTime}</span>`
        newMessage.appendChild(content)
        chatbox.appendChild(newMessage)

        contentMess = inputMess.innerText  // message visulize in friend list 
    }
    
    // clean input chat box 
    inputMess.innerHTML = ""

    //load message into list friend 
    let list = document.querySelectorAll('.blockchat')
    let activeUser
    // find target user  
    for (let e of list) {
        if (e.classList.contains('active')) {
            activeUser = e
            break
        }
    }
    if (activeUser) {
        activeUser.querySelector('.time').innerText = currentTime
        activeUser.querySelector('.message p').innerText = contentMess

        // set attribute number to order list friend 
        if (activeUser.hasAttribute('number')) {
            activeUser.setAttribute('number', ++PIVOT)
        }
        else activeUser.setAttribute('number', 1)
    }
    scrollDown()
})

// // receive message from friends 
// socket.on("reviecedMess", (mess) => {

//     // check active user 
//     if (CHATING_USER_ID != mess.from)  {
//         // load red nofity 
//         let listpeople = document.querySelectorAll('.chat-list .blockchat')
//         // find who send this message 
//         let sendPeople 
//         for (let e of listpeople) {
//             if (e.getAttribute('key') == mess.from) {
//                 sendPeople = e
//                 break 
//             }
//         }
//         console.log(sendPeople)
       
//         if (sendPeople) {
//              // load notify to user who send message
//             let notify = sendPeople.querySelector('b')
//             //if already has notification yet
//             if (notify) {
//                 let number = parseInt(notify.textContent, 10)
//                 number++
//                 notify.textContent = number
//             }
//             //if there has been no notification yet 
//             else {
//                 let newNotify = document.createElement('b')
//                 newNotify.textContent = 1
//                 sendPeople.querySelector('.message').appendChild(newNotify)
//             }
//             sendPeople.querySelector('.message p').textContent = mess.content
//             sendPeople.querySelector('.message p').style.fontWeight  = 700

//             // bring this user to the head of list friend 
//             let listFriend = document.querySelector('.chat-list')
//             listFriend.insertBefore(sendPeople, listFriend.firstChild)
//             sendPeople.setAttribute('number', ++PIVOT)   
//         }
//         return 
//     }

//     //if active
//     // const newMessage = document.createElement('div')
//     // newMessage.classList.add('mess', 'frnd-message')
//     // const content = document.createElement('p')
//     // content.innerHTML = `${mess.content} <br><span>${mess.time}</span>`
//     // newMessage.appendChild(content)
//     // chatbox.appendChild(newMessage)

//     loadNewFriendMessage(mess)

//     scrollDown()
// })

// //receive message from new friend 
// socket.on("sendNewFriend", (newFriend, newMessage) => {
//     console.log(newFriend)
//     let newDiv = document.createElement('div')
//     newDiv.classList.add('blockchat');
//     newDiv.setAttribute('key', newFriend.pool_conversation_id);  
//     newDiv.setAttribute('id', newMessage.conver);

//     newDiv.innerHTML = `
//             <div class="imgchat">
//                 <img src="${newFriend.avatar}" alt="" class="cover">
//             </div>
            
//             <div class="details">
//                 <div class="listHead">
//                     <h4>${newFriend.name}</h4>
//                     <h5 class="newfriend">New Friend</h5>
//                     <p class="time" >${newMessage.time}</p>
//                 </div>
//                 <div class="message">
//                     <p style="font-weight:700">${newMessage.content}</p>
//                     <b>1</b>
//                 </div>
//             </div>`

//     //add active event listener
//     newDiv.addEventListener('click', () => ActiveUser(newDiv))

//     // insert in front of list 
//     let chatList = document.querySelector('.chat-list');
//     chatList.insertBefore(newDiv, chatList.firstChild);
// })

// // green tick for new online user 
// socket.on("receiveOnline", (id) => {
//     console.log("new online", id)
//     let onlineUser = Array.from(document.querySelectorAll('.blockchat'))
//                           .find(e => e.getAttribute('key') === id)
//     if (onlineUser) {
//         onlineUser.querySelector('.online').style.visibility = 'visible'
//     }
// })

// // delete green tick for offline user 
// socket.on("receiveOffline", (id) => {
//     console.log("new offline", id)
//     let onlineUser = Array.from(document.querySelectorAll('.blockchat'))
//                           .find(e => e.getAttribute('key') === id)
//     if (onlineUser) {
//         onlineUser.querySelector('.online').style.visibility = 'hidden'
//     }
// })


// update pool conversation when close web
window.addEventListener('beforeunload', function (event) {
    let update = []
    document.querySelectorAll('.blockchat').forEach(e => {
        if (e.querySelector('.message p').textContent) {
            update.push({
                name                : e.querySelector('h4').textContent, 
                avatar              : e.querySelector('img').src, 
                id_conversation     : e.getAttribute('id'), 
                number              : e.hasAttribute('number') ? e.getAttribute('number') : 0, 
                recentMessage       : e.querySelector('.message p').textContent, 
                recentTime          : e.querySelector('.time').textContent,
                id_user             : e.getAttribute('key'),
                new                 : e.querySelector('.message b') ? e.querySelector('.message b').textContent : 0, 
                newfriend           : false  // auto already your friend 
            })
        }        
    })
    console.log("list", update)
    socket.emit('updatePoolConver', update, USER)
});


//LOG OUT USER 
document.querySelector('.header .logout').addEventListener('click', async () => {
    window.location.href = `${PORT}/login`
    const response = await fetch(`${PORT}/logout`)
    if (!response.ok) return Error('Error when log out')
})



