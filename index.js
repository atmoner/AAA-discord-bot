require('dotenv').config()
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const WebSocket = require('ws');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// var { startBcna, stopBcnaWs, startBcnaWs } = require('./chains/bcna.js');
var { startOsmo, stopOsmoWs, startOsmoWs } = require('./chains/osmosis.js');
  

const commands = [
  {
    name: 'start-watcher',
    description: 'Start monitoring blockchain data',
  },
  {
    name: 'stop-watcher',
    description: 'Stop monitoring blockchain data',
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN_DISCORD);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.')
    await rest.put(Routes.applicationCommands('1054035664540270593'), { body: commands })
    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error);
  }
})();


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'start-watcher') {  
    // startBcnaWs()
    // startBcna('', interaction, client)    
    startOsmoWs()
    startOsmo('', interaction, client)
    
    interaction.reply('Connected on osmosis blockchain from WebSocket\n tm.event=Tx ');
  }  
  
  if (interaction.commandName === 'stop-watcher') {
    interaction.channel.send('Stop-watcher')
    // stopBcnaWs(interaction, client)
    stopOsmoWs(interaction, client)
  }  
});

client.login(process.env.CLIENT_TOKEN_DISCORD)
 
