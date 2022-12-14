var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000

app.use(express.static(__dirname + "/public"))

var server = http.createServer(app)
server.listen(port)

console.log("http server listening on %d", port)

var wss = new WebSocketServer({ server: server })
console.log("websocket server created")

// app.get('/home', (req, res) => {
//     res.send("<h1>Hello</h1>")
// });

wss.on("connection", function(ws) {
    // var id = setInterval(function() {
    //     ws.send(JSON.stringify(new Date()), function() {})
    // }, 1000)

    ws.send('hello bro', (error) => {
        console.log(error);
    })

    ws.on('message', (message) => {
        ws.send([message, 'hello'])
    })

    console.log("websocket connection open")

    ws.on("close", function() {
        console.log("websocket connection close")
            // clearInterval(id)
    })
})