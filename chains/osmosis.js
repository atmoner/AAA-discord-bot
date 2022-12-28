require('dotenv').config()
const { EmbedBuilder } = require('discord.js');
const WebSocket = require('ws');
const mintscanUrlAccount = 'https://www.mintscan.io/osmosis/account/'
const mintscanUrlTxs = 'https://www.mintscan.io/osmosis/txs/'

const MSG_TRANSFERT  = '/ibc.applications.transfer.v1.MsgTransfer'
const MSG_DELEGATE   = '/cosmos.staking.v1beta1.MsgDelegate'
const MSG_UNDELEGATE = '/cosmos.staking.v1beta1.MsgUndelegate'

let ws = ''

const startOsmoWs =  async () => { 
  ws = new WebSocket(process.env.WS_OSMOSIS)
}

const startOsmo =  async (datas, interaction, client) => {  

  ws.on('open', function open() {
    ws.send(JSON.stringify({
      "method":"subscribe",
      "params": ["tm.event='Tx'"],
      "id":"1",
      "jsonrpc":"2.0"
    }))
  })

  ws.on('close', function close() {
    console.log('disconnected');
  })
  
  ws.on('message', function incoming(data) {

    var finalData = JSON.parse(data.toString('utf-8'))
    if (!finalData.result.events || typeof finalData.result.events['message.action'] === 'undefined') {
      return
    }

    events = finalData.result.events

    switch (finalData.result.events['message.action'][0]) {
      case MSG_TRANSFERT:
        let detailData = JSON.parse(events['send_packet.packet_data'][0])          
        const uDenom = detailData.denom.split('/')[-1]
  
        msgFields = [
          { name: '⬆️ From', value: detailData.sender },
          { name: '⬇️ To', value: detailData.receiver },
          { name: '🪙  Amount', value: detailData.amount + ' ' + uDenom, inline: true },
        ]
        sendDiscordAlert(client, process.env.OSMO_CHANNEL_IBC, 'New IBC Tx', events['tx.hash'][0], msgFields)
        break

      case MSG_DELEGATE:
        msgFields = [
          { name: '⬆️ To delegator', value: events['delegate.validator'][0] },
          { name: '🪙  Amount', value: events['delegate.amount'][0] },
        ]
        sendDiscordAlert(client, process.env.OSMO_CHANNEL_DELEGATE, 'New Delegate', events['tx.hash'][0], msgFields)
        break

      case MSG_UNDELEGATE:
        msgFields = [
          { name: '⬆️ From', value: events['unbond.validator'] },
          { name: '🪙  Amount', value: events['unbond.amount'] },
        ]
        sendDiscordAlert(client, process.env.OSMO_CHANNEL_UNDELEGATE, 'New Undelegate', events['tx.hash'][0], msgFields)
        break
      default:
        console.log('not supported msg', events['message.action'][0])
    }     
  })     
}

const stopOsmoWs =  async () => { 
  ws.close()
}

function sendDiscordAlert(client, channel, title, txHash, msgFields) {
  msg = createDiscordMSG(title, txHash, msgFields)
  client.channels.cache.get(channel).send({ embeds: [msg] })  
}

function createDiscordMSG(title, txHash, msgFields) {
  const msg = new EmbedBuilder()
  .setColor(0x0099FF)
  .setAuthor({ name: title, iconURL: 'https://coindataflow.com/uploads/coins/osmosis.png', url: mintscanUrlTxs+'/'+txHash })
  .setDescription('A new transaction has been detected! \nFind all the information relating to this transaction below')
  .setThumbnail('https://coindataflow.com/uploads/coins/osmosis.png')
  .addFields(...msgFields)
  .addFields({ name: '🔗  Tx hash', value: txHash })
  .setTimestamp()
  .setFooter({ text: 'AAA MetaHuahua', iconURL: 'https://d1fdloi71mui9q.cloudfront.net/YpCdNy3jRSycdDR8FQEN_0Wq62yUa4yV6dBuf' });
  return msg
}

module.exports = { startOsmo, startOsmoWs, stopOsmoWs }
