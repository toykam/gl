const socket = io();
// const chatForm = document.getElementById('chat-form')
const chatMessages = document.getElementById('messages')
const userInRoom = document.getElementById('users-in-room')
const roomName = document.getElementById('room-name')
const playButton = document.getElementById('play-button')
const pauseButton = document.getElementById('pause-button')
const stopButton = document.getElementById('stop-button')
    // const audio = document.getElementById("myAudio");
var audio = new Audio('/audio/inbox.mp3');
var music = document.getElementById("music");

stopButton.click();
// const msg = document.getElementById("msg");
// const user_is_typing = document.getElementById("user_is_typing");


// msg.focus()

const { name, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

// Join Room
socket.emit('JoinRoom', { name, room })
roomName.innerText = room;
// 
socket.on('UserListChanged', (users) => {
    playSound();
    console.log(users);
    displayUsers(users);
})

socket.on('message', (message) => {
    playSound();
    tata.text(`New message from ${message.username}`, `${message.message}`)
    displayMessage(message)
})

socket.on('user_is_typing', (message) => {
    user_is_typing.innerText = `${message}`;
})

// msg.addEventListener('keyup', (e) => {
//     var msg = e.target.value;
//     console.log(msg);
//     socket.emit('typing', msg)
// })

// Music Controller
playButton.addEventListener('click', () => {
    if (!music.paused && music.duration > 0) {
        music.currentTime = 0;
        music.pause();
    }
    music.play();
    socket.emit('music_state_changed', {
        'state': 'PLAYING',
        'current_duration': music.duration
    })
})

socket.on('music_state_changed', (data) => {
    if (data.state == 'PLAYING') {
        music = document.getElementById("music");
        music.currentTime = data.current_duration;
        music.play();
    } else if (data.state == 'PAUSED') {
        music = document.getElementById("music");
        music.currentTime = data.current_duration;
        music.pause();
    } else if (data.state == 'STOPPED') {
        music = document.getElementById("music");
        music.currentTime = 0;
        music.pause();
    }
})

pauseButton.addEventListener('click', () => {
    if (!music.paused && music.duration > 0) {
        // music.currentTime = 0;
        music.pause();
    }
    // music.play();
    socket.emit('music_state_changed', {
        'state': 'PAUSED',
        'current_duration': music.duration
    })
})

stopButton.addEventListener('click', () => {
    if (!music.paused && music.duration > 0) {
        music.currentTime = 0;
        music.pause();
    }
    socket.emit('music_state_changed', {
        'state': 'STOPPED',
        'current_duration': 0
    })
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
        var today = new Date();
        var time = today.getHours() + ":" + today.getMinutes();
        displayMessage({
            username: name,
            message: message.value,
            time
        })
        message.value = '';
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

function playSound() {
    if (!audio.paused && audio.duration > 0) {
        audio.currentTime = 0;
        audio.pause();
    }
    audio.play();
}