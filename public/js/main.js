const socket = io();
const chatForm = document.getElementById('chat-form')
const chatMessages = document.getElementById('messages')
const userInRoom = document.getElementById('users-in-room')
const roomName = document.getElementById('room-name')

const { name, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

// Join Room
socket.emit('JoinRoom', { name, room })
roomName.innerText = room;
// 
socket.on('UserListChanged', (users) => {
    console.log(users);
    displayUsers(users);
})

socket.on('message', (message) => {
    console.log(message);
    tata.text(`New message from ${message.username}`, `${message.message}`)
    displayMessage(message)
})

// Submit Message
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Get message from the input field
    const message = e.target.elements.msg;
    // Emit Message to the server
    // To make sure user is not sending am empty message, hahaha
    if (message.value.length > 0) {
        socket.emit('chatMessage', {
            'text': message.value,
        });
        socket.emit('message', message.text)
            // Clear input field
        message.value = '';

        displayMessage({
            username: name,
            message: message.value,
            time: Date()
        })
    }

})

// Display Message
function displayMessage(message) {
    const div = document.createElement('div');
    div.classList.add('chatbox__messages__user-message')
    div.innerHTML = `<div class="chatbox__messages__user-message--ind-message">
        <p class="name">${message.username} : ${message.time}</p>
        <br/>
        <p class="message">${message.message}</p>
    </div>`;
    chatMessages.appendChild(div)

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displayUsers(users) {
    userInRoom.innerHTML = '';
    users.map((user) => {
        const div = document.createElement('div');
        div.classList.add('chatbox__user--active')
        div.innerHTML = `<p>${user.name}</p>`

        userInRoom.appendChild(div)
    })
}