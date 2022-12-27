const WebSocket = require('ws');
const ws = new WebSocket('wss://rpc.osmosis.interbloc.org/websocket');

ws.on('open', function open() {
  console.log('Connected on Osmosis blockchain from WebSocket');
  ws.send(JSON.stringify({
    "method":"subscribe",
    "params": ["tm.event='Tx'"],
    "id":"1",
    "jsonrpc":"2.0"
  }));
});

ws.on('close', function close() {
  console.log('disconnected');
});
 
ws.on('message', function incoming(data) {
  var finalData = JSON.parse(data.toString('utf-8'));
    if (finalData.result.events) {
      console.log(finalData.result.events);
    }
});    
