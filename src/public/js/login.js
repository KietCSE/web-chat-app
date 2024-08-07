const PORT = "http://localhost:3000"

//LOGIN
document.querySelector('.login').addEventListener('click', () => {
    const acc = document.getElementById("login-account").value;
    const pwd = document.getElementById("login-pwd").value;
    
    let data = {
        account : acc, 
        password : pwd
    }
    //check
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
            sessionStorage.setItem('user', data.userID)
            window.location.href = `${PORT}/user/${data.userID}`
        }
        else {
            /*  VALIDATION     
            AUTHENTICATION */
            console.log('WRONG USER OR PASSWORD')
        }
    }) 
    .catch(erro => { 
        /*JS EXCEPTION HANDLER*/
        console.log(error)
    })
});


//REGISTER 
document.querySelector('.register').addEventListener('click', () => {
    const acc = document.getElementById("register-account").value;
    const pwd = document.getElementById("register-pwd").value;
    
    let data = {
        account : acc, 
        password : pwd
    }

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
        if (data.status === true) {
            sessionStorage.setItem('user', data.userID)
            window.location.href = `${PORT}/user/${data.userID}`
        }
        else {
             /* VALIDATION     
            AUTHENTICATION */
            console.log('WRONG USER OR PASSWORD')
        }
    }) 
    .catch(erro => { 
        /*JS EXCEPTION HANDLER*/
        console.log(error)
    })

});
