import socket from 'socket.io-client';
// const io = socket.connect('http://129.12.224.108:9000');

// const io = socket.connect('http://192.168.1.249:9000');
const io = socket.connect('http://localhost:80');


export default io;