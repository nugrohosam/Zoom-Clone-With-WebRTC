const socket = io("/")
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: PEER_HOST,
  port: PEER_PORT
})

const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  console.log('initial')
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    console.log('call started')
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      console.log('call stream started')
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    console.log('user connected')
    connectToNewUser(userId, stream)
  })
  
}).catch(e => {
  console.log(e)
})

socket.on('user-disconnected', userId => {
  console.log('user disconnect')
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  console.log('open peers')
  console.log(ROOM_ID)
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  console.log('connect to new user')
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    console.log('stream start')
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    console.log('stream close')
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  console.log('add video stream to DOM')
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })

  videoGrid.append(video)
}