const socket = io()

const messageForm = document.querySelector("#message-form");
const inputField = document.querySelector("input");
const sendMessageButton = document.querySelector("#send-message");
const sendLocationButton = document.querySelector("#send-location");
const chat = document.querySelector("#messages");
const sidebar = document.querySelector("#sidebar");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = () =>{
    const recentMessage = chat.lastElementChild;

    const recentMessageStyle = getComputedStyle(recentMessage);
    const recentMessageMargin = parseInt(recentMessageStyle.marginBottom);
    const recentMessageHeight =  chat.offsetHeight + recentMessageMargin;

    const visibleChatHeight = chat.offsetHeight;
    const chatHeight = chat.scrollHeight;
    const scrollOffset = chat.scrollTop + visibleChatHeight;

    if(chatHeight - recentMessageHeight <= scrollOffset){
        chat.scrollTop = chatHeight;
    }
}

socket.on("message", ({username,message,sentAt}) =>{
    const content = Mustache.render(messageTemplate,{
        username,
        message,
        timeStamp: sentAt
    });
    chat.insertAdjacentHTML("beforeend",content);
    autoscroll();
})

socket.on("location-message",({username,url,sentAt}) =>{
    const locationUrl = Mustache.render(locationTemplate,{
        username,
        location:url,
        timeStamp: sentAt
    });
    chat.insertAdjacentHTML("beforeend",locationUrl);
    autoscroll();
})

socket.on("users-room",({room,users}) =>{
    const sidebarContent = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    sidebar.innerHTML = sidebarContent;
    // sidebar.insertAdjacentHTML("afterbegin",sidebarContent);
})

messageForm.addEventListener("submit",(e) =>{
    e.preventDefault()

    sendMessageButton.setAttribute("disabled","disabled");
    const newMessage = e.target.elements.newMessage.value;

    socket.emit("send-message",newMessage,(status) =>{
        console.log(status);
        sendMessageButton.removeAttribute("disabled");
        inputField.value ="";
        inputField.focus();
    });
})

sendLocationButton.addEventListener("click",()=>{
    if(!navigator.geolocation){
        return alert("Geolocation not supported by browser!");
    }
    sendLocationButton.setAttribute("disabled","disabled");

    navigator.geolocation.getCurrentPosition((position) =>{
        socket.emit("send-location",
        {lat: position.coords.latitude, long: position.coords.longitude},
        (status) =>{
            console.log(status);
            sendLocationButton.removeAttribute("disabled");
        });
    })
})

socket.emit("join",{username,room}, (error) =>{
    if(error){
        alert(error);
        location.href = "/";
    }
})