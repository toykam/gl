const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path')
const http = require('http')
const Socket = require('socket.io');
const fileUpload = require('express-fileupload');
const initSocketConnections = require('./utils/socket-connections');
const expressSession = require('express-session');
const { SES_NAME, SES_SECRET } = require('./utils/constants')
const MongoDBStore = require('connect-mongodb-session')(expressSession);
require("dotenv").config()


var sessionStore = new MongoDBStore({
    uri: process.env.DATABASE_URL,
    collection: 'sessions'
})



const { 
    NODE_ENV = 'development',
    SESS_NAME = SES_NAME,
    SESS_SECRET = SES_SECRET
} = process.env

const IN_PROD = NODE_ENV == 'production' ? true : false 

// Enable cors
var cors = require('cors');
const { getUserDetail } = require('./utils/users');
const app = express();
const port = process.env.PORT || 4000;
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
        origin: ["*"],
        methods: ["GET", "POST", "PATCH"],
        allowedHeaders: ["me"],
        credentials: true
    }
},)
const musicIO = io.of('/music');

// Cors Options
var corsOptions = {
    // origin: ['http://localhost:3001', 'https://group-listening.herokuapp.com', 'http://localhost:3000',],
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))

// Set Static File to be served
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// app.use(expressValidator())
app.use(expressSession({
    name: SESS_NAME,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        sameSite: true, secure: IN_PROD
    },
    secret: SESS_SECRET,
    saveUninitialized: false, 
    resave: true,
    store: sessionStore,
}))

app.use(function (req, res, next) {
    if (!req.session) {
    return next(new Error("oh no")) // handle error
    }
    next() // otherwise continue
})

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: [
        path.join(__dirname, 'views/partials'),
        path.join(__dirname, 'views/partials/chat'),
        path.join(__dirname, 'views/partials/user'),
    ],
    helpers: require('./utils/handle-bars.helpers'),
}));

app.set('view engine', 'hbs');

app.use(fileUpload({
    createParentPath: true,
}));

// app.use((req, res, next) => {
//     // console.log(req.session)
//     next();
// })

const isLoggedInFunc = async(req, res, next) => {
    try {
        console.log(req.originalUrl)
        var session = req.session;

        var userId = session.userId;
        // var userId = req.session.userId;
        console.log("UserId", userId)
        if (userId) {
            var user = await getUserDetail({'uid': userId})
            res.locals.user = user;
            next(); 
        } else {
            session['intendingPath'] = req.originalUrl;
            
            res.redirect('/auth/login')
        }
    } catch (error) {
        res.redirect('/auth/login')
    }
}

app.use('/user', isLoggedInFunc)
app.use('/join', isLoggedInFunc)
app.use('/chat/join', isLoggedInFunc)

// Page ROutes
app.use('/chat', require('./routes/chat-route'))
app.use('/auth', require('./routes/auth-route'))
app.use('/user', require('./routes/user-route'))
app.use('/group', require('./routes/group-route'))

// Api Routes
app.use('/api/chat', require('./routes/api/chat-route'))
app.use('/api/auth', require('./routes/api/auth-route'))
app.use('/api/user', require('./routes/api/user-route'))
app.use('/api/group', require('./routes/api/group-route'))


app.use((req, res, next) => {
    const isLoggedin = req.session.userId != null;
    // console.log("IsLoggedIn ::: ", isLoggedin)
    // console.log("Session ::: ", req.session)
    req['isLoggedIn'] = isLoggedin;
    next();
})

app.get('/', (req, res) => {

    res.render('index', {
        'pageTitle': 'Home : Group Listening',
        'isLoggedIn': req['isLoggedIn']
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
