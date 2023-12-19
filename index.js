const fs = require('fs');
const cron = require('node-cron')
global.conf = require('./conf.json')
const { createAlerteTask , saveComptesConf} = require('./helpers/helpers')

const Discord = require('discord.js');

var myIntents = new Discord.Intents()
myIntents.add(Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGES)

global.client = new Discord.Client({intents: myIntents, partials: ['CHANNEL']});
global.client.commands = new Discord.Collection();
global.client.cooldowns = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		global.client.commands.set(command.name, command);
	}
}

try {
    if (fs.existsSync('./autoposts.json')) {
      global.autopostsconf = require('./autoposts.json')
    }else{
       global.autopostsconf = {} 
    }
  } catch(err) {
    console.error(err)
  }
if (global.autopostsconf != {}){
    global.autoposts = {}
    for(let [serveur,serveursAutoposts] of Object.entries(global.autopostsconf)){
        for(let [autopostName,autopostSettings] of Object.entries(serveursAutoposts)){
            if(!global.autoposts[serveur]) global.autoposts[serveur] = {}
            global.autoposts[serveur][autopostName] = cron.schedule(autopostSettings.cronExpression,async ()=>{
                const emploiDuTemps = require('./commands/Emploi du temps/timetable.js');
                emploiDuTemps.execute(autopostSettings.channelID,[autopostSettings.mode],autopostSettings.compte);
            })
        }
    }
}
else global.autoposts = {}

try {
    if (fs.existsSync('./alerts.json')) {
      global.alertesConf = require('./alerts.json')
    }else{
       global.alertesConf = {}
    }
} catch(err) {
    console.error(err)
}
if (global.alertesConf != {}){
    global.alertes = {}
    for(let [serveur,alertesServeur] of Object.entries(global.alertesConf)){
        for(let [nomAlerte,alerteConf] of Object.entries(alertesServeur)){
            if(!global.alertes[serveur]) global.alertes[serveur] = {}
            if (alerteConf.mention) global.alertes[serveur][nomAlerte] = createAlerteTask(alerteConf.compte,alerteConf.channel,alerteConf.mention)
            else global.alertes[serveur][nomAlerte] = createAlerteTask(alerteConf.compte,alerteConf.channel)
        }
    }
}
else global.alertes = {}

try {
    if (fs.existsSync('./account.json')) {
        global.comptesParDefaut = require('./account.json')
        for (let [user,compteParDefaut] of Object.entries(global.comptesParDefaut)){
            if (!global.conf.ed.accounts[compteParDefaut]) delete global.comptesParDefaut[user]
        }
        saveComptesConf(JSON.stringify(global.comptesParDefaut))
    }else{
        global.comptesParDefaut = {} 
    }
  } catch(err) {
    console.error(err)
  }

const token = global.conf.discord.token
const prefix = global.conf.discord.prefix

global.client.once('ready', () => {
    global.client.user.setActivity(`leah's school`, {type : "WATCHING"});
    console.log("Bot ready...");
})

global.client.on('messageCreate', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	

    const command = global.client.commands.get(commandName) || global.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return message.reply('nuh uh you.\'re not allowed');
        }
    }
    

    if (command.guildOnly && message.channel.type === 'DM') {
        return message.reply('cant use this cmd in dms sorry');
    }
    
    const { cooldowns } = global.client;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`wait for ${timeLeft.toFixed(1)} before re using\`${command.name}\`.`);
        }

    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);


	try {
        message.channel.sendTyping()
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply("argh a skill issue appeared contact @erotic please, i need help, this code is made with her feet");
	}
});


global.client.login(token);