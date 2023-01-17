class User {
    constructor(id,name) {
        this.id = id;
        this.name = name;
        this.teste()
    }

    teste(){
        socket.emit('sala', {
            id: user.id,
            name: user.name,
            candidate: event.candidate
        })
    }
    
    selfDestroy() {
        if(this.player) {
            this.player.remove()
        }

        if(this.pc) {
            this.pc.close()
            this.pc.onicecandidate = null
            this.pc.ontrack = null
            this.pc = null
        }
    }

    sendMessage(message) {
        if(this.dc) {
            this.dc.send(message)
        }

    }
}