document.addEventListener("DOMContentLoaded", () => {

    // let socket = io('http://localhost:3000')
    
    
    let loginForm = document.querySelector('.loginForm');
    let chatForm = document.querySelector('.chatForm');
    console.log(loginForm)
    
    function show(element) {
        if(element && element.style.display === "none") {
            element.style.display = "block"
        }
    }
    
    function hide(element) {
        if(element && element.style.display === "block") {
            element.style.display = "none"
        }
    }

    console.log(loginForm.style.display)
    
    show(loginForm);
    hide(chatForm);
});
