window.addEventListener("DOMContentLoaded", event => {
            var userData = localStorage.getItem('userData');
            userData = JSON.parse(userData);
            console.log("UserDataFromMusic.js ::: ", userData);
            const socket = io('/music', {
                'reconnection': true,
                'reconnectionDelay': 1,
                'reconnectionAttempts': Infinity,
                'transports': ['websocket'],
            });

            const chatForm = document.getElementById('chat-form')
            const leaveButton = document.getElementById('LeaveRoom')
            const room = document.getElementById('room-name').innerText;
            const roomName = document.getElementById('room-name-name').innerText;
            const name = userData['id'];
            const chatMessages = document.getElementById('messages')
            const musicToPlay = document.getElementById('music-to-play')
            const musicUploadForm = document.getElementById('music-upload-form')
            const userInRoom = document.getElementById('users-in-room')
                // const roomName = document.getElementById('room-name')
            const playButton = document.getElementById('play-button')
            const pauseButton = document.getElementById('pause-button')
            const stopButton = document.getElementById('stop-button')
            const musicName = document.getElementById('music-name')
                // const musicController = document.getElementById('music-button')
            var audio = new Audio('/public/audio/inbox.mp3');
            var music = document.getElementById("music");

            musicToPlay.addEventListener('change', (e) => {
                e.preventDefault();
                const files = document.querySelector('[id=music-to-play]').files;
                console.log('Files', files);
                const formData = new FormData();

                for (let i = 0; i < files.length; i++) {
                    let file = files[i]
                    formData.append('audio', file)
                }

                tata.text('New Message', 'Uploading music...');

                var request = new XMLHttpRequest();

                request.upload.addEventListener('progress', function(e) {
                    var file1Size = $('#music-to-play')[0].files[0].size;

                    if (e.loaded <= file1Size) {
                        var percent = Math.round(e.loaded / file1Size * 100);
                        $('#music-name').html(`Upload progress: ${percent} %`);
                        socket.emit('uploading_music', {
                            'message':`Music Upload progress: ${percent} %`,
                            'gid': room
                        });
                    }

                    if (e.loaded == e.total) {
                        $('#music-name').html(`Upload progress: 100 %`);
                    }
                });

                request.open('post', `/api/chat/upload/${room}`);
                request.timeout = 1450000;
                request.send(formData);

                request.onreadystatechange = function() {
                    if (request.readyState === 4) {
                        var res = JSON.parse(request.response);
                        // console.log(response);
                        if (res.status == true) {
                            socket.emit('music-changed', {
                                ...res.data,
                                'room': room,
                                'userId': name
                            });
                            tata.success(`Upload successful: ${res.message}`)
                        } else {
                            tata.error(`An error occurred: ${res.message}`)
                        }
                        musicUploadForm.reset();
                    }
                }
            })

            swal(`Welcome to ${roomName} Group`).then((value) => {
                        var playPromise = music.play();
                        music.currentTime = 0;
                        playPromise.then(_ => music.pause());

                        socket.on('connection_error', (error) => {
                            swal('An Error occurred');
                        })

                        socket.on('uploading_music', (message) => {
                            musicName.innerText = `${message}`;
                        })

                        socket.on('changed-music', (fileData) => {
                            console.log("ChangedMusic ::: ", fileData)
                            stopButton.click();
                            music.removeAttribute('src');
                            // music.setAttribute('src', '');
                            music.setAttribute('src', `/public/audio/${room}-group/${fileData.name}`);
                            musicName.innerText = `${fileData.name}`;
                        })

                        socket.on('ErrorOccurred', (message) => {
                            tata.error('Message', message.message);
                            swal('Oops', `${message.message}`, 'error').then(_ => {
                                if (_) location.assign('/group/join')
                            });
                        })

                        // Join Room
                        console.log(name)
                        console.log(room)
                        socket.emit('JoinRoom', { uid: name, gid: room })

                        socket.on('UserListChanged', (users) => {
                            playSound();
                            console.log('UserListChanged: ', users);
                            displayUsers(users);
                        })

                        socket.on('welcome', (data) => {
                            console.log('Welcome message to group: ', data)
                            leaveButton.addEventListener('click', () => {
                                swal({
                                    text:`Do you want to leave the group?`,
                                    button: {
                                        text: 'Leave group',
                                    }
                                }).then(_ => {
                                    if (_) {
                                        socket.emit('LeaveGroup', {gid: room, uid: userData['_id']})
                                    }
                                })
                            })
                        })

                        socket.on('LeaveGroup', () => {
                            swal('You have successfully left the group').then(_ => {
                                location.assign('/group/join')
                            })
                        })

                        socket.on('message', (message) => {
                            console.log(message);
                            playSound();
                            tata.text(`New message from ${message.user.name}`, `${message.text}`)
                            displayMessage(message)
                        })

                        socket.on('user_is_typing', (message) => {
                            console.log(socket)
                            user_is_typing.innerText = `${message}`;
                        })

                        msg.addEventListener('keyup', (e) => {
                            var msg = e.target.value;
                            // console.log(msg);
                            socket.emit('typing', {message: msg, name: userData['name'], groupId: room})
                        })

                        // Music Controller
                        playButton.addEventListener('click', () => {
                            if (!music.paused && music.duration > 0) {
                                music.currentTime = 0;
                                music.pause();
                            }
                            $('#play-button').hide();
                            $('#pause-button').show();
                            $('#stop-button').show();

                            socket.emit('music_state_changed', {
                                'state': 'PLAYING',
                                'current_duration': music.currentTime,
                                'room': room
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
                                music.pause();
                            }
                            $('#play-button').show();
                            $('#pause-button').hide();
                            $('#stop-button').show();
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
                            $('#play-button').show();
                            $('#pause-button').hide();
                            $('#stop-button').hide();
                            socket.emit('music_state_changed', {
                                'state': 'STOPPED',
                                'current_duration': music.currentTime
                            })
                        })

                        socket.on('welcome', (group) => {
                            
                            if (group.group.currentMusic != null) {
                                var musicData = group.group.currentMusic;
                                console.log(musicData)
                                music.setAttribute('src', `/public/audio/${room}-group/${musicData.name}`);
                                music.currentTime = musicData.currentPosition;
                                musicName.innerText = `${musicData.name}`;
                                if (group.group.state == 'PLAYING') {
                                    music.play();
                                }
                            }
                        })

                        // Submit Message
                        chatForm.addEventListener('submit', (e) => {
                            e.preventDefault();
                            // Get message from the input field
                            const message = e.target.elements.msg;
                            console.log("Message ::: ",message);
                            // Emit Message to the server
                            // To make sure user is not sending am empty message, hahaha
                            if (message.value.length > 0) {
                                socket.emit('chatMessage', {
                                    'text': message.value,
                                    uid: userData['_id'], groupId: room
                                });
                                socket.emit('message', message.text)
                                message.value = '';
                            }
                        })

                        music.addEventListener('timeupdate', (data) => {
                            // console.log(music.paused)

                            if (music.paused) {
                                socket.emit('music-current-time-changed', {
                                    userId: userData['_id'], groupId: room,
                                    'time': music.currentTime, 'state': 'PAUSED',
                                })
                            } else {
                                playButton.style.display = 'hidden';
                                pauseButton.style.display = 'inline';
                                socket.emit('music-current-time-changed', {
                                    userId: userData['_id'], groupId: room,
                                    'time': music.currentTime, 'state': 'PLAYING' 
                                })
                            }
                            var duration = music.duration;
                            var currentTime = music.currentTime;

                            var sec = new Number();
                            var min = new Number();

                            var currSec = new Number();
                            var currMin = new Number();

                            sec = Math.floor(duration);
                            min = Math.floor(sec / 60);

                            currSec = Math.floor(currentTime);
                            currMin = Math.floor(currSec / 60);

                            min = min >= 10 ? min : '0' + min;
                            sec = Math.floor(sec % 60);
                            sec = sec >= 10 ? sec : '0' + sec;

                            currMin = currMin >= 10 ? currMin : '0' + currMin;
                            currSec = Math.floor(currSec % 60);
                            currSec = currSec >= 10 ? currSec : '0' + currSec;

                            $("#total_duration").text(min + ":" + sec + ' <==> ' + currMin + ":" + currSec);

                            if (music.duration == music.currentTime) {
                                stopButton.click();
                                playButton.click();
                            }
                        })

                        // Display Message
                        function displayMessage(message) {
                            const div = document.createElement('div');
                            div.classList.add('chatbox__messages__user-message')
                            div.innerHTML = `<div class="chatbox__messages__user-message--ind-message">
                <p class="name">${message.user.name} : ${message.createdAt}</p>
                <br/>
                <p class="message">${message.text}</p>
            </div>`;
                            chatMessages.appendChild(div)

                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }

                        function displayUsers(users) {
                            userInRoom.innerHTML = '';
                            users.map((user) => {
                                        const div = document.createElement('div');
                                        div.setAttribute('userId', user.user.id);
                                        // div.setAttribute('onclick', "switchToAdmin()")
                                        div.classList.add(`chatbox__user--${user.isAdmin == true ? 'active' : 'busy'}`)
                                        div.innerHTML = `<div>
                    <p>${user.user.name}</p>
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

        function switchToAdmin(e) {
            alert('clicked')
        }
    });
            // var myDetail;
});