function showLoading() {
    showPanel('loading')
    hidePanel('fail')
    hidePanel('connect')
    hidePanel('players')
}

function showFail() {
    hidePanel('loading')
    showPanel('fail')
    hidePanel('connect')
    hidePanel('players')
}

function showForm() {
    hidePanel('entrar-sala')
    hidePanel('criar-sala')
    hidePanel('loading')
    hidePanel('fail')
    showPanel('connect')
    showPanel('escolha')
    hidePanel('players')
}

function showPlayers() {
    hidePanel('loading')
    hidePanel('fail')
    hidePanel('connect')
    showPanel('players')
}

function exibirPlayVideo(){
    // https://www.youtube.com/watch?v=pnZ6H5Xd-Qw
    // https://www.twitch.tv/gaules
    // https://vimeo.com/771635802
    url = document.getElementById("inputLinkVideo").value
    
    hidePanel('youtube');
    hidePanel('twitch');
    hidePanel('erroplayvideo');
    try{
    url = url.split("//")[1];

    url = url.split(".");
    
    if(url[0]=='vimeo'){
        url = url[1].split('com/')[1];

        showPanel('youtube');
        url = 'https://player.vimeo.com/video/'+url;
    }else if(url[1]=='youtube'){
        url = url[2].split('watch?v=');
        if(url.length==2){
            url=url[1];
        }else{
            url=url[0];
            url=url.split('embed/')[1];
        }

        showPanel('youtube');
        url = 'https://www.youtube.com/embed/'+url;
    }else if(url[1]=='twitch'){
        url = url[2].split('tv/')[1];

        showPanel('twitch');

    }else{

        showPanel('erroplayvideo');
    }
    document.getElementById('link-video').src = url;
    usuarios.url = url;
    new Twitch.Embed("twitch-embed", {
        width: 420,
        height: 315,
        channel: url,
        layout: "video",
        parent: ["embed.example.com", "othersite.example.com"]  });  
    }catch(e){
        showPanel('erroplayvideo');
    }

    let usuAdm = usuarios.find(e=>e.adm==true)
    if(usuAdm){
        if(usuAdm.id ==socket.id){
            //eu sou adm e posso alterar a url do link
            socket.emit('sala',{"url":url,"usuario":usuAdm})
        }
    }
}
// function addVideoPlayer(stream) {
//     var template = new DOMParser().parseFromString('<div class="col"><div class="videoWrapper card"><video class="responsive-video" autoplay></video></div></div>', 'text/html')
//     template.getElementsByTagName('video')[0].srcObject = stream
//     var  divPlayer = template.body.childNodes[0]
//     document.getElementById('players-row').appendChild(divPlayer)
//     return divPlayer
// }

function hidePanel(name) {
    document.getElementById(name).classList.add("hide")
}

function showPanel(name) {
    document.getElementById(name).classList.remove("hide")
}

function setLocalPlayerStream() {
    // document.getElementById('local-player').srcObject = myStream
    // document.getElementById('preview-player').srcObject = myStream
}

function removeAllMessages() {
    var parent = document.getElementById('message-printer')
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function addMessage(message) {
    var parent = document.getElementById('message-printer')
    var p = document.createElement('p')
    p.innerHTML = message

    filho = parent.firstChild
    parent.insertBefore(p,filho)
}