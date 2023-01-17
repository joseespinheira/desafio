// var getUserMedia
// var myStream
var socket
const users = new Map()
var usuarios = []

var nomeUsuario = '';
var nomeSala = '';

document.addEventListener('DOMContentLoaded', function () {


    document.getElementById('button-entrar-sala').addEventListener('click', exibeEntra)
    document.getElementById('button-criar-sala').addEventListener('click', exibeCriar)
    document.getElementById('button-voltar').addEventListener('click', exibeInicio)

    document.getElementById('roomForm').addEventListener('submit', enterInRoom)
    document.getElementById('chatForm').addEventListener('submit', broadcastChatMessage)
    document.getElementById('leave').addEventListener('click', leave)

    
    // myStream = stream
    setLocalPlayerStream()
    showForm()
    // navigator.mediaDevices.getUserMedia({ video: {
    //     height: 480,
    //     width: 640
    // }, audio: true })
    // .then(function (stream) {
    // }).catch(function (err) {
    //     showFail()
    // })
}, false)

function initServerConnection(room, username) {
    var socket = io({
        query: {
            room: room,
            user: username
        }
    })

    socket.on('disconnect-user', function (data) {
        var user = users.get(data.id)
        if (user) {
            users.delete(data.id)
            user.selfDestroy()
        }
    })

    socket.on('call', function (data) {
        let user = new User(data.id, username)
        user.pc = createPeer(user)
        users.set(data.id, user)
        var elementoTexto = document.getElementById("meerro");
        elementoTexto.innerHTML = "Adm reescreva o link no campo indicado";
        createOffer(user, socket)
    })

    socket.on('sala',function(data){
        usuarios = data.salas;
        atualizaSala()
    })

    socket.on('offer', function (data) {
        var user = users.get(data.id)
        if (user) {
            answerPeer(user, data.offer, socket)
        } else {
            let user = new User(data.id, username)
            user.pc = createPeer(user)
            users.set(data.id, user)
            answerPeer(user, data.offer, socket)
        }
    })

    socket.on('answer', function (data) {

        var user = users.get(data.id)
        if (user) {
            user.pc.setRemoteDescription(data.answer)
        }
        
    })

    socket.on('candidate', function (data) {
        var user = users.get(data.id)
        if (user) {
            user.pc.addIceCandidate(data.candidate)
        } else {
            let user = new User(data.id, username)
            user.pc = createPeer(user)
            user.pc.addIceCandidate(data.candidate)
            users.set(data.id, user)
        }
    })

    socket.on('connect', function () {
        showPlayers();
    })

    socket.on('connect_error', function (error) {
        leave()
    })

    return socket
}

function enterInRoom(e) {
    e.preventDefault()
    user = document.getElementById('input-username').value
    room = document.getElementById('inputRoom').value

    this.nomeSala = document.getElementById('input-username').value;
    this.nomeUsuario = document.getElementById('inputRoom').value;

    if (room) {
        socket = initServerConnection(room, user)
        

        exibirPlayVideo();
    }
}

function atualizaSala(){
    
        hidePanel('link-field-video')

        this.usuarios.forEach(i=>{
            //user do navegador
            if(i.id==socket.id && i.adm==true){
                showPanel('link-field-video')
                document.getElementById('inputLinkVideo').addEventListener('blur', exibirPlayVideo)

            }
        })

        let usuarioUrl = this.usuarios.find(i=>i.link);
        if(usuarioUrl){  
            if(document.getElementById("inputLinkVideo").value==''){
                document.getElementById("inputLinkVideo").value = usuarioUrl.link
                exibirPlayVideo() 
            }
        }
}

function broadcastChatMessage(e) {
    e.preventDefault()




    var message = document.getElementById('inputChatMessage').value

    addMessage(message)

    for (var user of users.values()) {
        user.sendMessage(message)
    }

    document.getElementById('inputChatMessage').value = ''

    elem = document.getElementById('users')
    // teste = '';
    // users.forEach(user => {
    //     teste += `<li>${user.name} - ${user.id}</li>`
    // });
    // elem.innerHTML = `<li>${user.name} - ${user.id}</li>`
}

function leave() {
    socket.close()
    for (var user of users.values()) {
        user.selfDestroy()
    }
    users.clear()
    removeAllMessages()
    showForm()
}

function exibeEntra(){
    hidePanel('escolha')
    showPanel('entrar-sala')
}
function exibeCriar(){
    hidePanel('escolha')
    showPanel('criar-sala')
}
function exibeInicio(){
    hidePanel('escolha')
    showForm()
}