//create socket 
const PORT = "http://localhost:3000"

const socket = io(PORT);
const inputMess = document.querySelector('.chat-input input[type="text"]'); 
const chatbox = document.querySelector('.chatbox')

// scroll 
function scrollDown() {
    chatbox.scrollTop = chatbox.scrollHeight
}
scrollDown()

//make user online 
function UpdateOnlineUser() {
    let userID = sessionStorage.getItem('user')
    var data = {
        user: userID, 
        socketID : socket.id
    };

    fetch(`${PORT}/load-online`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        console.log('update online successfully')
    })
    .catch(err => {
        console.error('Error:', err);
    }); 
}

//CLICK ON PEOPLE TO CHAT ------
function LoadConversation(mess) {
    let userID = sessionStorage.getItem('user')
    chatbox.textContent = ''

    mess.forEach(e => {
        let newMessage = document.createElement('div')
        if (e.from != userID) 
            newMessage.classList.add('mess', 'my-message')
        else 
            newMessage.classList.add('mess', 'frnd-message')

        let chatContent = document.createElement('p')
        chatContent.innerHTML = `${e.content} <br><span>${e.updatedAt}</span>`
        newMessage.appendChild(chatContent)
        chatbox.appendChild(newMessage)
    })
} 


document.querySelectorAll('.blockchat').forEach(e => {
    e.addEventListener('click', () => {
        //if already active user
        if (e.classList.contains('active')) return 

        //else active new user 
        document.querySelectorAll('.blockchat').forEach(element => {
            element.classList.remove('active')
        })
        e.classList.add('active')

        // fetch API to collect message from database 
        fetch(`${PORT}/chat/${e.id}`)
        .then(respone => respone.json())
        .then(res => {
            LoadConversation(res)
        })
        .catch(err => {
            //  ERROR
        })
    })
})




//-----------------------------



socket.on('connect', ()=>{
    console.log("Connect successfully", socket.id)
    UpdateOnlineUser()
})

// send mess 
inputMess.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        socket.emit("sendMess", event.target.value, )
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
    const newMessage = document.createElement('div')
    newMessage.classList.add('mess', 'frnd-message')
    const content = document.createElement('p')
    content.innerHTML = `${mess} <br><span>12:15</span>`
    newMessage.appendChild(content)
    chatbox.appendChild(newMessage)
    scrollDown()
})