
document.querySelector('button').addEventListener('click', () => {
    const userID = document.querySelector('input[type="text"]').value;
    console.log(userID);

    sessionStorage.setItem('user', userID)
    window.location.href = '/'

});
