require('dotenv').config()
const { EmbedBuilder } = require('discord.js');
const WebSocket = require('ws');
const mintscanUrlAccount = 'https://www.mintscan.io/osmosis/account/'
const mintscanUrlTxs = 'https://www.mintscan.io/osmosis/txs/'
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
    // IBC discord channel
    if (finalData.result.events) {
      if (typeof finalData.result.events['message.action'] !== 'undefined') {
        if (finalData.result.events['message.action'][0] === '/ibc.applications.transfer.v1.MsgTransfer') {

          let detailData = JSON.parse(finalData.result.events['send_packet.packet_data'][0])          
          const uDenom = detailData.denom.split('/')

          const ibcEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ name: 'New IBC Tx', iconURL: 'https://coindataflow.com/uploads/coins/osmosis.png', url: mintscanUrlTxs+'/'+finalData.result.events['tx.hash'][0] })
            .setDescription('A new transaction has been detected! \nFind all the information relating to this transaction below')
            .setThumbnail('https://coindataflow.com/uploads/coins/osmosis.png')
            .addFields(
              { name: '⬆️ From', value: detailData.sender },
              { name: '⬇️ To', value: detailData.receiver },
              { name: '🪙  Amount', value: detailData.amount + ' ' +detailData.denom, inline: true },
            )
            .addFields({ name: '🔗  Tx hash', value: finalData.result.events['tx.hash'][0] })
            .setTimestamp()
            .setFooter({ text: 'AAA MetaHuahua', iconURL: 'https://d1fdloi71mui9q.cloudfront.net/YpCdNy3jRSycdDR8FQEN_0Wq62yUa4yV6dBuf' });
 
            client.channels.cache.get(process.env.OSMO_CHANNEL_IBC).send({ embeds: [ibcEmbed] })
        } 
        if (finalData.result.events['message.action'][0] === '/cosmos.staking.v1beta1.MsgUndelegate') {
          // inside a command, event listener, etc.
          const undelegateEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ name: 'New Undelegate', iconURL: 'https://coindataflow.com/uploads/coins/osmosis.png', url: mintscanUrlTxs+'/'+finalData.result.events['tx.hash'][0] })
            .setDescription('A new Undelegate has been detected! \nFind all the information relating to this transaction below')
            .setThumbnail('https://coindataflow.com/uploads/coins/osmosis.png')
            .addFields(
              { name: '⬆️ From', value: finalData.result.events['unbond.validator'] },
              { name: '🪙  Amount', value: finalData.result.events['unbond.amount'] },
            )
            .addFields({ name: '🔗  Tx hash', value: finalData.result.events['tx.hash'][0] })
            .setTimestamp()
            .setFooter({ text: 'AAA MetaHuahua', iconURL: 'https://d1fdloi71mui9q.cloudfront.net/YpCdNy3jRSycdDR8FQEN_0Wq62yUa4yV6dBuf' });

            client.channels.cache.get(process.env.OSMO_CHANNEL_UNDELEGATE).send({ embeds: [undelegateEmbed] })          
        }
        if (finalData.result.events['message.action'][0] === '/cosmos.staking.v1beta1.MsgDelegate') {
          
          const delegateEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setAuthor({ name: 'New Undelegate', iconURL: 'https://coindataflow.com/uploads/coins/osmosis.png', url: mintscanUrlTxs+'/'+finalData.result.events['tx.hash'][0] })
            .setDescription('A new Delagation has been detected! \nFind all the information relating to this transaction below')
            .setThumbnail('https://coindataflow.com/uploads/coins/osmosis.png')
            .addFields(
              { name: '⬆️ To delegator', value: finalData.result.events['delegate.validator'][0] },
              { name: '🪙  Amount', value: finalData.result.events['delegate.amount'][0] },
            )
            .addFields({ name: '🔗  Tx hash', value: finalData.result.events['tx.hash'][0] })
            .setTimestamp()
            .setFooter({ text: 'AAA MetaHuahua', iconURL: 'https://d1fdloi71mui9q.cloudfront.net/YpCdNy3jRSycdDR8FQEN_0Wq62yUa4yV6dBuf' });   
          
            client.channels.cache.get(process.env.OSMO_CHANNEL_DELEGATE).send({ embeds: [delegateEmbed] })     
            // client.channels.cache.get('1055141853814599720').send(finalData.result.events['tx.hash'][0])    
        }   
      }
    }       
  })     
}

const stopOsmoWs =  async () => { 
  ws.close()
}

module.exports = { startOsmo, startOsmoWs, stopOsmoWs }
