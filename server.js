require('dotenv').config()

const express = require('express')
const app = express()
const server = require('http').Server(app)
const {
  v4: uuidV4
} = require('uuid')
const port = process.env.PORT || Math.floor(Math.random() * 50000)

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
    providerSocketHost: process.env.PROVIDER_SOCKET_HOST || "https://socket.nugrohosamiyono.com",
    providerSocketPort: process.env.PROVIDER_SOCKET_PORT || 443
  })
})

console.log('start in port ' + port)
server.listen(port)