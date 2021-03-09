const TYPE_FUNCTION = "TYPE_FUNCTION"
const TYPE_MESSAGE = "TYPE_MESSAGE"

const socket = new io.connect(PROVIDER_SOCKET_HOST + ":" + PROVIDER_SOCKET_PORT, {
  transports: ["polling"]
})

const videoGrid = document.getElementById("video-grid")
const myPeer = new Peer()
const myVideo = document.createElement("video")
const hostname = window.location.hostname
myVideo.muted = true

// contract event
const roomConn = `connection-with-${hostname}`

// default data event require join room
const joinRoom = `${roomConn}-join-room`
const privateRoomConn = `${roomConn}-private-room`
const disconnectRoom = `${roomConn}-disconnect`

const userConnected = "user-connected"

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

  myPeer.on("call", call => {
    call.answer(stream)
    const video = document.createElement("video")
    call.on("stream", userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on(userConnected, message => {
    console.log("called :", userConnected, "with message ", message)
    if (isJson(message)) {
      const data = JSON.parse(message)
      const userId = data?.token || null
      if (!userId) {
        console.log("not found user id")
        return
      }

      console.log("call connect to new user", userId)
      connectToNewUser(userId, stream)
    } else {
      console.log(message)
    }
  })

}).catch(e => {
  console.log(e)
})

socket.on(disconnectRoom, message => {
  console.log("called :", disconnectRoom)
  if (isJson(message)) {
    const data = JSON.parse(message)
    const userId = data?.token || null
    if (!userId) {
      console.log("not found user id")
      return
    }

    if (peers[userId]) peers[userId].close()
  } else {
    console.log(message)
  }
})

myPeer.on("open", id => {
  console.log("open conn to :", joinRoom)
  socket.emit(joinRoom, JSON.stringify({ room_id: ROOM_ID, token: id }))
  const message = {
    room_id: ROOM_ID,
    data: {
      name: userConnected,
      type: TYPE_MESSAGE,
      message: {
        token: id
      }
    }
  }

  console.log("emiting :", privateRoomConn, "with message", privateRoomConn)
  socket.emit(privateRoomConn, JSON.stringify(message))
})

function connectToNewUser(userId, stream) {
  console.log("connect to new user :", userId)

  const call = myPeer.call(userId, stream)
  const video = document.createElement("video")

  call.on("stream", userVideoStream => {
    addVideoStream(video, userVideoStream)
  })

  call.on("close", () => {
    console.log("stream close")
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener("loadedmetadata", () => {
    video.play()
  })

  videoGrid.append(video)
}