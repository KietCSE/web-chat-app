import * as ListMessage from './ListMessage.js'

//create socket
const PORT = "http://localhost:3000"

const socket = io(PORT);
const inputMess = document.querySelector('.chat-input input[type="text"]'); 
const chatbox = document.querySelector('.chatbox')

var USER = sessionStorage.getItem('user')
export var CHATING_USER_ID = ""
var CHATING_CONVER_ID = ""

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
        'conver'     : CHATING_CONVER_ID, 
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
} 

// active user are chating 
function ActiveUser(e) {
    //if already active user
    if (e.classList.contains('active')) return 

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

// send mess 
inputMess.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        let mess = createMessage(event.target.value)
        socket.emit("sendMess", mess)
        
        const newMessage = document.createElement('div')
        newMessage.classList.add('mess', 'my-message')
        const content = document.createElement('p')
        content.innerHTML = `${event.target.value} <br><span>12:15</span>`
        newMessage.appendChild(content)
        chatbox.appendChild(newMessage)
        inputMess.value = ""
    
        scrollDown()
    }
})

socket.on("reviecedMess", (mess) => {
    console.log(mess)

    // check active user 
    if (CHATING_USER_ID != mess.from)  {
        // ListMessage.PushMessage(mess)
        // console.log(ListMessage.queue) 
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


// CLICK MAKE NEW FRIEND 
const newfriend = document.querySelector('.search-chat button')
const listpeople = document.querySelector('.find-friend')

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

        //create new box chat for new friend 
        let newDiv = document.createElement('div')
        newDiv.classList.add('blockchat');
        newDiv.setAttribute('key', NewKeyFriend);  
        // newDiv.setAttribute('id', this.id);

        newDiv.innerHTML = `
                <div class="imgchat">
                    <img src="#" alt="" class="cover">
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

        //update chating-user
        CHATING_USER_ID = e.getAttribute('key')
        CHATING_CONVER_ID = e.id

        // clear content
        chatbox.textContent = ''

    })
}) 


