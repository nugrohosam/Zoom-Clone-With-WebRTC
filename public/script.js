const socket = io('/')

const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: process.env.HOST_PEER,
  port: process.env.PORT_PEER
})

const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)
  console.log('initial')

  myPeer.on('call', call => {
    console.log('call')
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {

      console.log('stream started')
      addVideoStream(video, userVideoStream)
    })
  })
  
  socket.on('user-connected', userId => {
    console.log('user connected')
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  console.log('user disconnected')
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  console.log('open')
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  console.log('connected new user')

  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {

    console.log('stream connected')
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {

    console.log('stram close')
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })

  console.log('should be load and append')
  videoGrid.append(video)
}