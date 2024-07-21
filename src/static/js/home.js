//create socket 
const socket = io("http://localhost:3000");
const inputMess = document.querySelector('.chat-input input[type="text"]'); 
const chatbox = document.querySelector('.chatbox')

// scroll 
function scrollDown() {
    chatbox.scrollTop = chatbox.scrollHeight
}
scrollDown()

//make user online 
function UpdateOnlineUser() {
    const userID = sessionStorage.getItem('user')
    var data = {
        user: userID, 
        socketID : socket.id
    };

    fetch(`http://localhost:3000/load-online`, {
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