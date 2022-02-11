/**
 * 参数：[socketOpen|socketClose|socketMessage|socketError] = func，[socket连接成功时触发|连接关闭|发送消息|连接错误]
 * timeout：连接超时时间
 * @type {module.webSocket}
 */
import { wsSendMsg, decodeSocketMsg } from '@utils/common'
class webSocket {
    constructor(param = {}) {
        this.param = param;
        this.reconnectCount = 0;
        this.socket = null;
        this.taskRemindInterval = null;
        this.isSucces = true;
        this.timeout = 30000;   // 30s发送一次请求
        this.timeoutObj = null
        this.serverTimeoutObj = null
    }

    resetHeartCheck = () => {
        // 重置心跳检测
        clearInterval(this.timeoutObj)
        clearTimeout(this.serverTimeoutObj)
        sessionStorage.lostConnectionCount = 0
    }
    
    startHearCheck = () => {
        // 开启心跳检测
        this.timeoutObj = setTimeout(() => {
            // keepalive 机制
            this.socket.send(wsSendMsg(null, '0x80040010'))

            this.serverTimeoutObj = setTimeout(() => {
                // 长时间未收到服务器回应
                sessionStorage.lostConnectionCount = sessionStorage.getItem('lostConnectionCount') ? +sessionStorage.lostConnectionCount + 1 : 1

                // 3次+服务端未响应，断开socket连接
                if (+sessionStorage.lostConnectionCount > 3) {
                    this.socket.close()
                }
            }, this.timeout);
        }, this.timeout);
    }

    connection = () => {
        let { socketUrl } = this.param;

        // 检测当前浏览器是什么浏览器来决定用什么socket
        if ('WebSocket' in window) {
            this.socket = new WebSocket(socketUrl);
        }

        // 数据传输格式设置
        this.socket.binaryType = 'arraybuffer';
        
        this.socket.onopen = this.onopen;
        this.socket.onmessage = this.onmessage;
        this.socket.onclose = this.onclose;
        this.socket.onerror = this.onerror;
        this.socket.sendMessage = this.sendMessage;
        this.socket.closeSocket = this.closeSocket;
    }

    // 连接成功触发
    onopen = () => {
        let { socketOpen } = this.param;
        this.isSucces = false  //连接成功将标识符改为false
        socketOpen && socketOpen();
        
        // 开启心跳检测
        this.resetHeartCheck()
        this.startHearCheck()
    }

    // 后端向前端推送数据
    onmessage = (msg) => {
        let { socketMessage } = this.param;
        socketMessage && socketMessage(decodeSocketMsg(msg.data));
        // 打印出后端推送数据
        console.log('decodeSocketMsg', decodeSocketMsg(msg.data));

        // 开启心跳检测
        this.resetHeartCheck()
        this.startHearCheck()
    }

    // 关闭连接触发
    onclose = (e) => {
        this.isSucces = true   //关闭将标识符改为true
        console.log('关闭socket收到的数据');
        let { socketClose } = this.param;
        socketClose && socketClose(e);

        // 15s后重连
        setTimeout(() => {
            this.connection()
        }, 15000);
        this.resetHeartCheck()
    }

    onerror = (e) => {
        // socket连接报错触发
        let { socketError } = this.param;
        this.socket = null;
        socketError && socketError(e);
    }

    sendMessage = (value, msgCode) => {
        // 向后端发送数据
        if (this.socket) {
            this.socket.send(wsSendMsg(value, msgCode));
        }
    }
}

export default webSocket