const PORT = "http://localhost:3000"

const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});


//LOGIN
document.querySelector('.login').addEventListener('click', (event) => {
    event.preventDefault();
    const acc = document.querySelector(".login-account").value;
    const pwd = document.querySelector(".login-pwd").value;
    
    let data = {
        account : acc, 
        password : pwd
    }
    //check user account 
    fetch(`${PORT}/checklogin`, {
        method : 'POST', 
        headers : {
            'Content-Type': 'application/json'
        }, 
        body : JSON.stringify(data)
    })
    .then(res => res.json()) 
    .then(data => {
        if (data.status === true) {
            // store cookie username and avatar 
            sessionStorage.setItem('user', data.userID)
            sessionStorage.setItem('username', data.username)
            sessionStorage.setItem('avatar', data.avatar)
            window.location.href = `${PORT}/user/${data.userID}`
        }
        else {
            /*  VALIDATION     
            AUTHENTICATION */
            console.log('WRONG USER OR PASSWORD')
            console.log(data.message)
        }
    }) 
    .catch(erro => { 
        /*JS EXCEPTION HANDLER*/
        console.log(error)
    })
});


//REGISTER 
document.querySelector('.register').addEventListener('click', (event) => {
    event.preventDefault();
    const acc = document.querySelector(".register-account").value;
    const pwd = document.querySelector(".register-pwd").value;
    const name = document.querySelector(".register-name").value;
    const img = document.querySelector(".register-img").value;

    const avatar = img ? img : 'https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg'

    let data = {
        account : acc, 
        password : pwd, 
        username : name, 
        avatar : avatar,
    }

    console.log(data)

    // CREATE ACCOUNT FOR NEW USER 
    fetch(`${PORT}/create-new-user`, {
        method : 'POST', 
        headers : {
            'Content-Type': 'application/json'
        }, 
        body : JSON.stringify(data)
    })
    .then(res => res.json()) 
    .then(data => {
        console.log(data)
        if (data.status === true) {
           
            // store cookie username and avatar
            sessionStorage.setItem('user', data.userID)
            sessionStorage.setItem('username', data.username)
            sessionStorage.setItem('avatar', data.avatar)
            window.location.href = `${PORT}/user/${data.userID}`
        }
        else {
             /* VALIDATION     
            AUTHENTICATION */
            console.log(data.message)
            console.log('WRONG USER OR PASSWORD')
        }
    }) 
    .catch(error => { 
        /*JS EXCEPTION HANDLER*/
        console.log(error)
    })

});
