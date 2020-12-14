const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path')
const fs = require('fs');
const http = require('http')
const Socket = require('socket.io');
const session = require('express-session');
const connection = require('./models/connection');
// const MongoStore = require('connect-mongo')(session);

// const connectionStore = new MongoStore({
//     mongooseConnection: connection.mongoose,
//     collection: 'sessions'
// })

const fileUpload = require('express-fileupload');
const initSocketConnections = require('./utils/socket-connections');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app)
const io = Socket(server)

// initialize socket connection
initSocketConnections(io)

// Set Static File to be served
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }));

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs', partialsDir: 'partials' }));
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

app.get('/home', (req, res) => {
    res.render('index', {
        'pageTitle': 'Home'
    });
})


server.listen(port, () => {
    console.log(`Server running on port : ${port}`)
})