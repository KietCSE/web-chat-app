import * as home from './home.js' 
const PORT = "http://localhost:3000"
//SOCKER SEND MESSAGE -----------------------------------------------------------

console.log("Connected")

const socket = home.socket

socket.on('connect', ()=>{
    console.log("Connect successfully", socket.id)
    home.UpdateOnlineUser()
})


// receive message from friends 
socket.on("reviecedMess", (mess) => {

    // check active user 
    if (home.CHATING_USER_ID != mess.from)  {
        // load red nofity 
        let listpeople = document.querySelectorAll('.chat-list .blockchat')
        // find who send this message 
        let sendPeople 
        for (let e of listpeople) {
            if (e.getAttribute('key') == mess.from) {
                sendPeople = e
                break 
            }
        }
        console.log(sendPeople)
       
        if (sendPeople) {
             // load notify to user who send message
            let notify = sendPeople.querySelector('b')
            //if already has notification yet
            if (notify) {
                let number = parseInt(notify.textContent, 10)
                number++
                notify.textContent = number
            }
            //if there has been no notification yet 
            else {
                let newNotify = document.createElement('b')
                newNotify.textContent = 1
                sendPeople.querySelector('.message').appendChild(newNotify)
            }
            sendPeople.querySelector('.message p').textContent = mess.content
            sendPeople.querySelector('.message p').style.fontWeight  = 700

            // bring this user to the head of list friend 
            let listFriend = document.querySelector('.chat-list')
            listFriend.insertBefore(sendPeople, listFriend.firstChild)
            sendPeople.setAttribute('number', ++PIVOT)   
        }
        return 
    }

    home.loadNewFriendMessage(mess)
    home.scrollDown()
})

//receive message from new friend 
socket.on("sendNewFriend", (newFriend, newMessage) => {
    console.log(newFriend)
    let newDiv = document.createElement('div')
    newDiv.classList.add('blockchat');
    newDiv.setAttribute('key', newFriend.pool_conversation_id);  
    newDiv.setAttribute('id', newMessage.conver);
    newDiv.setAttribute('number', home.PIVOT)
    newDiv.innerHTML = `
            <div class="imgchat">
                <img src="${newFriend.avatar}" alt="" class="cover">
            </div>
            
            <div class="details">
                <div class="listHead">
                    <h4>${newFriend.name}</h4>
                    <h5 class="newfriend">New Friend</h5>
                    <p class="time" >${newMessage.time}</p>
                </div>
                <div class="message">
                    <p style="font-weight:700">${newMessage.content}</p>
                    <b>1</b>
                </div>
            </div>`

    //add active event listener
    newDiv.addEventListener('click', () => home.ActiveUser(newDiv))

    // insert in front of list 
    let chatList = document.querySelector('.chat-list');
    chatList.insertBefore(newDiv, chatList.firstChild);
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


// delete green tick for offline user 
socket.on("receiveOffline", (id) => {
    console.log("new offline", id)
    let onlineUser = Array.from(document.querySelectorAll('.blockchat'))
                          .find(e => e.getAttribute('key') === id)
    if (onlineUser) {
        onlineUser.querySelector('.online').style.visibility = 'hidden'
    }
})



