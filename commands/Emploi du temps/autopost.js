const cron = require('node-cron');
const fs = require('fs')

function getChannelIDFromMention(mention){
    if (!mention) return "Not a mention !";
    
    if (mention.startsWith('<#') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        return mention;
    }
    else return "Not a mention !"
}

function saveAutopostConf(newConf){
    fs.writeFile('./autoposts.json', newConf, function (err) {
        if (err) {
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            return;
        }
        });
}

module.exports = {
    name: "autopost",
    aliases: ["autoposts"],
    description: "\nautopost create <\"name\"> <account-name> <#channel> <day/week> <\"cron-format\">: autopost a change in the time table (<cron-format> : delay between each posts in the cron format. <https://crontab.cronhub.io/> to generate, day/week : time table mode : day or week)\n\n autopost list : list all the automatic posts\n\n autopost delete <name> : delete an automatic post",
    guildOnly: true,
    memberpermissions:"MANAGE_MESSAGES",
    cooldown: 5,
    usage: "create/list/delete <arguments>",
    execute(message, args) {
        (async ()=>{
            var method = args.shift().toLowerCase();
            if (method == 'create'){
                var name = args.shift();
                if (global.autopostsconf[message.guild.id] && global.autopostsconf[message.guild.id][name]) return message.reply(`already exists under the name ${name}`);

                var compte = args.shift()
                if (!global.conf.ed.accounts[compte]) return message.reply('account does not exist')

                var channelID = getChannelIDFromMention(args.shift());
                if (channelID == "Not a mention !") return message.reply('invalid data');
                
                var modeEDT = args.shift().toLowerCase()
                if (modeEDT != 'j' && modeEDT != 's') return message.reply('the time table mode must be "d" or "w"')

                var cronFormat = args.join(" ");
                if(!cron.validate(cronFormat)) return message.reply('invalid cron format, use http://www.csgnetwork.com/crongen.html to generate');
                if(!global.autopostsconf[message.guild.id]) global.autopostsconf[message.guild.id] = {}
                global.autopostsconf[message.guild.id][name] = {
                    channelID : channelID,
                    cronExpression : cronFormat,
                    mode : modeEDT,
                    compte : compte
                }
                let newConf = JSON.stringify(global.autopostsconf);
                saveAutopostConf(newConf);
                

                if (!global.autoposts[message.guild.id]) global.autoposts[message.guild.id] = {}
                global.autoposts[message.guild.id][name] = cron.schedule(cronFormat,async ()=>{
                    const emploiDuTemps = require('./timetable.js');
                    emploiDuTemps.execute(channelID,[modeEDT],compte);
                })
                message.reply('auto post activated :white_check_mark:')
            }
            else if (method == 'list'){
                var reponse = [`the enabled autoposts on **${message.guild.name}** are :\n`]
                for(let [clee,element] of Object.entries(global.autopostsconf[message.guild.id])){
                    reponse.push(`**${clee}** :\nChannel : <#${element.channelID}>, Cron Expression :${element.cronExpression} , mode : ${element.mode}\n`)
                }
                if (reponse.length == 1) return message.reply('Aucun post automatique n\'est actuellement actif sur ce serveur !');
                return message.reply(reponse.join(""))
            }
            else if (method == 'delete'){
                if (!args[0]) return message.reply(`invalid args ! do ${global.conf.discord.prefix}help autopost`)
                var autopostToDelete = args.shift();
                if(!global.autopostsconf[message.guild.id][autopostToDelete]) return message.reply(`the autopost ${autopostToDelete} doesn't exist`)
                global.autoposts[message.guild.id][autopostToDelete].stop();
                delete global.autoposts[message.guild.id][autopostToDelete]
                delete global.autopostsconf[message.guild.id][autopostToDelete]

                let newConf = JSON.stringify(global.autopostsconf);
                saveAutopostConf(newConf)

                message.reply(`the autopost ${autopostToDelete} got deleted`)
            } 
            else {
                message.reply(`invalid args ! do ${global.conf.discord.prefix}help autopost`)
            }
        })();
    },
};