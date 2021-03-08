const socket = new io.connect(PROVIDER_SOCKET)
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer()
const myVideo = document.createElement('video')
myVideo.muted = true

const TYPE_FUNCTION = "TYPE_FUNCTION"
const TYPE_MESSAGE = "TYPE_MESSAGE"

// contract event
const roomConn = `connection-with-${hostname}`

// default data event require join room
const joinRoom = `${roomConn}-join-room`
const privateRoomConn = `${roomConn}-private-room`
const disconnectRoom = `${roomConn}-disconnect`

const userConnected = 'user-connected'

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on(userConnected, message => {
    if (isJson(message)) {
      const data = JSON.stringify(message)
      const userId = data.message.token
      connectToNewUser(userId, stream)
    } else {
      console.log(message)
    }
  })

}).catch(e => {
  console.log(e)
})

socket.on(disconnectRoom, message => {
  if (isJson(message)) {
    const data = JSON.stringify(message)
    const userId = data.message.token
    if (peers[userId]) peers[userId].close()
  } else {
    console.log(message)
  }
})

myPeer.on('open', id => {
  socket.emit(joinRoom, JSON.stringify({ room_id: ROOM_ID, token: id }))
  const message = {
    token: id,
    data: {
      name: userConnected,
      message: {
        token: id
      }
    }
  }

  socket.emit(privateRoomConn, JSON.stringify(message))
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')

  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })

  call.on('close', () => {
    console.log('stream close')
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })

  videoGrid.append(video)
}