window.addEventListener("DOMContentLoaded", event => {

            const socket = io();
            // const chatForm = document.getElementById('chat-form')
            const chatMessages = document.getElementById('messages')
            const musicToPlay = document.getElementById('music-to-play')
            const musicUploadForm = document.getElementById('music-upload-form')
            const userInRoom = document.getElementById('users-in-room')
            const roomName = document.getElementById('room-name')
            const playButton = document.getElementById('play-button')
            const pauseButton = document.getElementById('pause-button')
            const stopButton = document.getElementById('stop-button')
            const musicController = document.getElementById('music-button')
                // const audio = document.getElementById("myAudio");
            var audio = new Audio('/audio/inbox.mp3');
            var music = document.getElementById("music");

            const { name, room } = Qs.parse(location.search, {
                ignoreQueryPrefix: true
            })

            musicToPlay.addEventListener('change', (e) => {
                e.preventDefault();
                const files = document.querySelector('[id=music-to-play]').files;
                console.log('Files', files);
                const formData = new FormData();

                for (let i = 0; i < files.length; i++) {
                    let file = files[i]
                    formData.append('audio', file)
                }

                tata.text('New Message', 'Uploading music...')

                fetch(`/chat/upload/${room}`, {
                    method: 'POST',
                    body: formData,
                }).then((response) => response.text()).then(response => {
                    var res = JSON.parse(response);
                    // console.log(response);
                    if (res.status == true) {
                        socket.emit('music-changed', res.data);
                        tata.success(`An error occurred: ${res.message}`)
                    } else {
                        tata.error(`An error occurred: ${res.message}`)
                    }
                    musicUploadForm.reset();
                })
            })

            // musicUploadForm.setAttribute('action', `/chat/upload/${room}`)

            swal(`Welcome to ${room} Group`).then((value) => {
                        var playPromise = music.play();
                        music.currentTime = 0;
                        playPromise.then(_ => music.pause());

                        // uploader.addEventListener('complete', (fileData) => {
                        //     console.log(fileData);
                        //     stopButton.click();
                        //     socket.emit('music-changed', { fileData });
                        //     music = new Audio(`/audio/${room}-group/${fileData.file.name}`);
                        //     tata.text('New Message', 'Upload complete')
                        // })

                        socket.on('changed-music', (fileData) => {
                            // To Stop The Music
                            console.log('Music Changed Notification From Server', fileData);
                            stopButton.click();
                            music.setAttribute('src', `/audio/${room}-group/${fileData.name}`);
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
                            socket.emit('music_state_changed', {
                                'state': 'PLAYING',
                                'current_duration': music.currentTime
                            })
                            music.play();
                        })

                        socket.on('music_state_changed', (data) => {
                            console.log(data);
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
                                'current_duration': music.currentTime
                            })
                        })

                        stopButton.addEventListener('click', () => {
                            if (!music.paused && music.duration > 0) {
                                music.currentTime = 0;
                                music.pause();
                            }
                            socket.emit('music_state_changed', {
                                'state': 'STOPPED',
                                'current_duration': music.currentTime
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
                                        div.classList.add(`chatbox__user--${user.type == 'admin' ? 'active' : 'busy'}`)
                                        div.innerHTML = `<div>
                    <p>${user.name}</p>
                    ${user.type =='admin' ? '' : user.type =='admin' ? '<button class="switch-admin" id="`${user.id}`">swap admin</button>' : ''}
                </div>`
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
            });
            // var myDetail;
});