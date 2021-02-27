const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
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
    peerHost: process.env.PEER_HOST,
    peerPort: process.env.PEER_PORT
  })
})

io.on('connection', socket => {
    console.log("came in")

    socket.on('join-room', (roomId, userId) => {
      console.log("joining room")
      console.log(roomId + " -- " + userId)

      socket.to(roomId).broadcast.emit('user-connected', userId)

      socket.on('disconnect', () => {
        console.log("disconnect")
        socket.to(roomId).broadcast.emit('user-disconnected', userId)
      })
    })
  })
  .on('error', e => {
    console.log(e)
  })

const port = process.env.PORT || 3000
console.log('start in port ' + port)
server.listen(port)