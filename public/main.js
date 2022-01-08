let Peer = require('simple-peer');
let socket = io();
const video = document.querySelector('video');
let client = {}

// get video stream
// gets user video and mic on default/full quality
navigator.mediaDevices.getUserMedia({video: true, audio: true})
// if user allows
.then(stream => {
    // shows user themselves
    socket.emit('NewClient')
    video.srcObject = stream;
    video.play();

    // define new peer and return it
    // used to initialize a peer
    function InitPeer(type){
        // check if init is true or false
        let peer = new Peer({initiator:(type=='init')?true:false, stream:stream, trickle: false})
    //    when the stream from other user, create vid
        peer.on('stream', function(stream){
            CreateVideo(stream)
        })
        // when user leaves
        peer.on('close', function(){
            document.getElementBYId('peerVideo').remove();
            peer.destroy()
        })
        return peer
    }
    // for peer of type init
    // for the peer which was sent the offer
    function MakePeer(){
        // till we get an ans form user
        client.gotAnswer = false;
        let peer = InitPeer("init");
        peer.on('signal', function(data){
            // send offer if it hasn't already
            if(!client.gotAnswer){
                socket.emit('Offer', data)
            }
        })
        client.peer = peer;
    }
        // for peer of type init
// when peer gets an offer, to send ans
    function FrontAnswer(offer){
        let peer = InitPeer('notInit');
        // if we get signal, offer accepted
        // function doesn't run automatically => need to call
        peer.on('signal', (data)=>{
            socket.emit("Answer", data);
        })
        peer.signal(offer);
    }

    function SignalAnswer(answer){
        client.gotAnswer = true;
        let peer = client.peer;
        peer.signal(answer);
    }

    function CreateVideo(stream){
        let video = document.createElement('video');
        video.id = 'peerVideo';
        video.srcObject = stream;
        video.class = 'embed-responsive-item';
        document.guerySelector('#peerDiv').appendChild(video);
        video.play();
    }

    // when 2 are already there and someone else joins
    function SessionActive(){
        document.write('Session Active. Please come back later')
    }
    socket.on('BackOffer', FrontAnswer)
    socket.on('BackAnswer', SignalAnswer)
    socket.on('SessionActive', SessionActive)
    socket.on('CreatePeer', MakePeer)
})
.catch(err => document.write(err))

checkboxTheme.addEventListener('click', () => {
    if (checkboxTheme.checked == true) {
        document.body.style.backgroundColor = '#212529'
        if (document.querySelector('#muteText')) {
            document.querySelector('#muteText').style.color = "#fff"
        }

    }
    else {
        document.body.style.backgroundColor = '#fff'
        if (document.querySelector('#muteText')) {
            document.querySelector('#muteText').style.color = "#212529"
        }
    }
}
)

function CreateDiv() {
    let div = document.createElement('div')
    div.setAttribute('class', "centered")
    div.id = "muteText"
    div.innerHTML = "Click to Mute/Unmute"
    document.querySelector('#peerDiv').appendChild(div)
    if (checkboxTheme.checked == true)
        document.querySelector('#muteText').style.color = "#fff"
}