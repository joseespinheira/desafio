const EVENT_CONNECTION = 'connection'
const EVENT_CALL = 'call'
const EVENT_OFFER = 'offer'
const EVENT_ANSWER = 'answer'
const EVENT_CANDIDATE = 'candidate'
const EVENT_DISCONNECT_USER = 'disconnect-user'

const EVENT_DISCONNECT = 'disconnect'

class SocketService {

    salas=[];

    insereNaSalaSeNaoExistir(cliente,sala){
        let existe = sala.find(cli=>cli.sala == cliente.sala && cli.user==cliente.user && cli.id==cliente.id);
        if (!existe){
            sala.push(cliente);
        }
    }

    defineAdm(sala){
        if(sala.length == 0){
            return;
        }

        let temAdm = sala.reduce((acc,cur)=>cur.adm==true?acc+1:acc+0,0)

        if(sala.length == 1){
            sala[0].adm = true;
            return;
        }
        // define novo adm, ou poderia fechar a sala
        if(temAdm == 0 && sala.length > 1){
            sala[0].adm = true;
            return;
        }
    }

    constructor(http) {
        this.init(http)
    }

    init(http) {
        this.io = require('socket.io')(http)

        this.io.on(EVENT_CONNECTION, (socket) => {
            const room = socket.handshake.query.room;
            const link = socket.handshake.query.link;
            const user = socket.handshake.query.user;
            if (!room) {
                socket.disconnect()
            } else {
                socket.join(room)

                const cliente = {"sala":room,"user":user,id:socket.id,"link":link}
                if( this.salas[room] == null){
                    this.salas[room] = [cliente];
                }else{
                    if(this.salas[room].length > 0){
                        this.insereNaSalaSeNaoExistir(cliente,this.salas[room]);
                        this.io.emit("sala", {
                            salas: this.salas[room]
                        })
                    }else{
                        this.salas[room] = [cliente];
                    }
                }

                this.defineAdm(this.salas[room]);

                
                socket.to(room).emit(EVENT_CALL, { id: socket.id, name:user })

                // retorna as pessoas da sala
                socket.on('sala', (data) => {
                    if (JSON.stringify(data) != '{}') {
                        // this.salas[data.usuario.sala] = {'url':data.url};
                        let usuAdm = this.salas[data.usuario.sala].find(i=>i.adm ==true)
                        usuAdm.link = data.url;
                    }

                    const sala = this.salas[room].find(sala=>sala.user == user);

                    this.io.emit("sala", {
                        salas: this.salas[room]
                    })
                })

                socket.on(EVENT_OFFER, (data) => {
                    socket.to(data.id).emit(EVENT_OFFER, {
                        id: socket.id,
                        name: socket.name,
                        offer: data.offer
                    })
                })

                socket.on(EVENT_ANSWER, (data) => {
                    socket.to(data.id).emit(EVENT_ANSWER, {
                        id: socket.id,
                        name: user,
                        answer: data.answer
                    })
                })

                socket.on(EVENT_CANDIDATE, (data) => {
                    socket.to(data.id).emit(EVENT_CANDIDATE, {
                        id: socket.id,
                        name: user,
                        candidate: data.candidate
                    })
                })

                socket.on(EVENT_DISCONNECT, () => {

                    const sala = this.salas[room].find(sala=>sala.user == user);
                    this.salas[room].splice(this.salas[room].indexOf(sala),1);


                    // this.defineAdm();
                    this.io.emit(EVENT_DISCONNECT_USER, {
                        id: socket.id
                    })
                })
            }
        })
    }
}

module.exports = (http) => {
    return new SocketService(http)
}