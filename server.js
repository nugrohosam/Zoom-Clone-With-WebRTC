require('dotenv').config()

const express = require('express')
const app = express()
const server = require('http').Server(app)
const {
  v4: uuidV4
} = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', {
    roomId: req.params.room,
    host: process.env.HOST || "localhost",
    peerPort: process.env.PEER_PORT || 3000,
    peerHost: process.env.PEER_HOST || "localhost",
    providerSocket: process.env.PROVIDER_SOCKET || "socket.nugrohosamiyono.com"
  })
})

const port = process.env.PORT || 4000
console.log('start in port ' + port)
server.listen(port)