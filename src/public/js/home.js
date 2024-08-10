// import { online } from '../../util/Online.js';
// import * as ListMessage from './ListMessage.js'

//create socket
const PORT = "http://localhost:3000"

const socket = io(PORT);
const inputMess = document.querySelector('.chat-input input[type="text"]'); 
const chatbox = document.querySelector('.chatbox')
const listBlockChat = document.querySelectorAll('.blockchat')

var USER = sessionStorage.getItem('user')   // id of user 
export var CHATING_USER_ID = ""
var CHATING_CONVER_ID = ""

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
function createMessage(mess) {
    return {
        'from'      : USER, 
        'to'        : CHATING_USER_ID,
        'conver'    : CHATING_CONVER_ID, 
        'content'   : mess, 
        'time'      : getTime()
    }
}

// scroll 
function scrollDown() {
    chatbox.scrollTop = chatbox.scrollHeight
}
scrollDown()

//make user online 
function UpdateOnlineUser() {
    
    var data = {
        userID: USER, 
        socketID : socket.id
    };

    //load new online-user into server 
    fetch(`${PORT}/load-online`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        // update current user 
        console.log('update online successfully')
        if (data.status) {
            let listOnlineFriend = data.data
            listBlockChat.forEach(element => {
               if (element.getAttribute('key') in listOnlineFriend) {
                    element.querySelector('.online').style.visibility = 'visible'
               }
            })
        }
    })
    .catch(err => {
        console.error('Error:', err);
    }); 
}


//CLICK ON PEOPLE TO CHAT ------

function LoadConversation(mess) {
    chatbox.textContent = ''
    mess.forEach(e => {
        let newMessage = document.createElement('div')
        if (e.from === USER) 
            newMessage.classList.add('mess', 'my-message')
        else 
            newMessage.classList.add('mess', 'frnd-message')

        let chatContent = document.createElement('p')
        chatContent.innerHTML = `${e.content} <br><span>${e.time}</span>`
        newMessage.appendChild(chatContent)
        chatbox.appendChild(newMessage)
    })  
    scrollDown()
} 

// active user are chating 
function ActiveUser(e) {
    //if already active user
    if (e.classList.contains('active')) return 

    //change name of chating user 
    let chatingName = e.querySelector('h4').textContent
    document.getElementById('chating-name').innerText = chatingName

    //change avatar of chating user 
    let avatar = e.querySelector('img').src
    document.getElementById('chating-avatar').src = avatar

    //else active new user 
    document.querySelectorAll('.blockchat').forEach(element => {
        element.classList.remove('active')
    })
    e.classList.add('active')
    //update chating-user
    CHATING_USER_ID = e.getAttribute('key')
    CHATING_CONVER_ID = e.id

    //delete current chat 
    chatbox.textContent = ''

    //delete notify
    let nofity = e.querySelector('b')
    if (nofity) nofity.remove()

    // fetch API to collect message from database 
    fetch(`${PORT}/chat/${e.id}`)
    .then(respone => respone.json())
    .then(res => {
        LoadConversation(res)
    })
    .catch(err => {
        //  ERROR
    })
}

document.querySelectorAll('.blockchat').forEach(e => {
    e.addEventListener('click', () => ActiveUser(e))
})

//-----------------------------
//SOCKER SEND MESSAGE 

socket.on('connect', ()=>{
    console.log("Connect successfully", socket.id)
    UpdateOnlineUser()
})

// send mess to friends 
inputMess.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        let mess = createMessage(event.target.value)

        socket.emit("sendMess", mess)
        
        let currentTime = getTime()

        // load message into box chat 
        let newMessage = document.createElement('div')
        newMessage.classList.add('mess', 'my-message')
        let content = document.createElement('p')
        content.innerHTML = `${event.target.value} <br><span>${currentTime}</span>`
        newMessage.appendChild(content)
        chatbox.appendChild(newMessage)
        inputMess.value = ""
        

        //load message into list chat 
        let list = document.querySelectorAll('.blockchat')
  
        let activeUser 
        for (let e of list) {
            if (e.classList.contains('active')) {
                activeUser = e
                break
            }
        }
        if (activeUser) {
            activeUser.querySelector('.time').innerText = currentTime
            activeUser.querySelector('.message p').innerText = mess.content
        }

        scrollDown()
    }
})

// receive message from friends 
socket.on("reviecedMess", (mess) => {

    // check active user 
    if (CHATING_USER_ID != mess.from)  {
        // load red nofity 
        let listpeople = document.querySelectorAll('.chat-list .blockchat')
        let sendPeople 
        for (let e of listpeople) {
            if (e.getAttribute('key') == mess.from) {
                sendPeople = e
                break 
            }
        }
        console.log(sendPeople)
        if (sendPeople) {
            let notify = sendPeople.querySelector('b')
            if (notify) {
                let number = parseInt(notify.textContent, 10)
                number++
                notify.textContent = number
            }
            else {
                let newNotify = document.createElement('b')
                newNotify.textContent = 1
                sendPeople.querySelector('.message').appendChild(newNotify)
            }
        }
        return 
    }

    //if active
    const newMessage = document.createElement('div')
    newMessage.classList.add('mess', 'frnd-message')
    const content = document.createElement('p')
    content.innerHTML = `${mess.content} <br><span>${mess.time}</span>`
    newMessage.appendChild(content)
    chatbox.appendChild(newMessage)

    scrollDown()
})

//receive message from new friend 
socket.on("sendNewFriend", (newFriend, newMessage) => {
    console.log(newFriend)
    let newDiv = document.createElement('div')
    newDiv.classList.add('blockchat');
    newDiv.setAttribute('key', newFriend.pool_conversation_id);  
    newDiv.setAttribute('id', newMessage.conver);

    newDiv.innerHTML = `
            <div class="imgchat">
                <img src="#" alt="" class="cover">
            </div>
            
            <div class="details">
                <div class="listHead">
                    <h4>${newFriend.name}</h4>
                    <p class="time">${newMessage.time}</p>
                </div>
                <div class="message">
                    <p>${newMessage.content}</p>
                    <b>1</b>
                </div>
            </div>`

    //add active event listener
    newDiv.addEventListener('click', () => ActiveUser(newDiv))

    // insert in front of list 
    let chatList = document.querySelector('.chat-list');
    chatList.insertBefore(newDiv, chatList.firstChild);
    console.log("okeokeoke")
})

// green tick for new online user 
socket.on("receiveOnline", (id) => {
    console.log("new online", id)
    let onlineUser = Array.from(document.querySelectorAll('.blockchat'))
                          .find(e => e.getAttribute('key') === id)
    if (onlineUser) {
        onlineUser.querySelector('.online').style.visibility = 'visible'
    }
})

socket.on("receiveOffline", (id) => {
    console.log("new offline", id)
    let onlineUser = Array.from(document.querySelectorAll('.blockchat'))
                          .find(e => e.getAttribute('key') === id)
    if (onlineUser) {
        onlineUser.querySelector('.online').style.visibility = 'hidden'
    }
})


// CLICK MAKE NEW FRIEND 
const newfriend = document.querySelector('.search-chat button')
const listpeople = document.querySelector('.find-friend')

//click on new friend button
newfriend.addEventListener('click', () => {
    listpeople.style.visibility = 'visible';

    document.addEventListener('click', (event) => {
        if (!listpeople.contains(event.target) && event.target !== newfriend) {
            listpeople.style.visibility = 'hidden';
        }
    });
 
});


//ADD NEW BOX CHAT OF NEW FRIEND 
document.querySelectorAll('.list-friend button').forEach(e => {
    e.addEventListener('click', (event) => {
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
                        <p class="time"></p>
                    </div>
                    <div class="message">
                        <p></p>
                    </div>
                </div>`

        //add active event listener
        newDiv.addEventListener('click', () => ActiveUser(newDiv))

        document.querySelector('.chat-list').appendChild(newDiv)
        
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

