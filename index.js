const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path')
const fs = require('fs');
const http = require('http')
const Socket = require('socket.io');
const session = require('express-session');
const connection = require('./models/connection');
// Enable cors
var cors = require('cors')

const fileUpload = require('express-fileupload');
const initSocketConnections = require('./utils/socket-connections');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app)

const io = Socket(server, {
    serveClient: true,
    reconnection: true,
    reconnectionDelayMax: 5000,
    reconnectionDelay: 1000,
    reconnectionAttempts: Infinity,
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 30000,
    upgradeTimeout: 20000,
    cors: {
        origin: ["http://localhost:3001", "http://localhost:3000", "https://group-listening.herokuapp.com"],
        methods: ["GET", "POST", "PATCH"],
        allowedHeaders: ["me"],
        credentials: true
    }
},)
const musicIO = io.of('/music');

// Cors Options
var corsOptions = {
    origin: ['http://localhost:3001', 'https://group-listening.herokuapp.com', 'http://localhost:3001'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))
app.use((req, res, next) => {
    req.user = null;
    next();
})

// Set Static File to be served
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }));

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: [
        path.join(__dirname, 'views/partials'),
        path.join(__dirname, 'views/partials/chat'),
    ]
}));
app.set('view engine', 'hbs');

app.use(fileUpload({
    createParentPath: true,
}));

// Page ROutes
app.use('/chat', require('./routes/chat-route'))
app.use('/auth', require('./routes/auth-route'))
app.use('/user', require('./routes/user-route'))
app.use('/group', require('./routes/group-route'))

// Api Routes
app.use('/api/chat', require('./routes/api/chat-route'))
app.use('/api/auth', require('./routes/api/auth-route'))
app.use('/api/user', require('./routes/api/user-route'))

app.get('/', (req, res) => {
    res.render('index', {
        'pageTitle': 'Home : Group Listening'
    });
})


server.listen(port, () => {
    console.log(`Server running on port : ${port}`)
})

musicIO.use((socket, next) => {
    console.log(`${socket.id} connected to the music namespace here with request ${socket.request}`)
    next();
})
initSocketConnections(musicIO)