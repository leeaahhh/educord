const { saveComptesConf } = require('../../helpers/helpers')
const { Util } = require('discord.js')

module.exports = {
    name: "account",
    aliases: ["comptes","account","accounts"],
    description: "\n``list`` : lists all available accounts\n``switch <account-name>`` : change default account",
    guildOnly: false,
    memberpermissions:"VIEW_CHANNEL",
    cooldown: 2,
    usage: "<list/switch/sw> <arguments>",
    execute(message, args) {
        if (args[0]) {
            var method = args.shift();
            if (method == 'list') {
            var msg = ['all the available accounts are :\n']
            for (let [nomCompte] of Object.entries(global.conf.ed.accounts)) {
                msg.push(`${nomCompte}, `)
            }
            msg = msg.join('').slice(0,-2)+`\n Do \`\`${global.conf.discord.prefix}account switch <account-name>\`\` to switch accounts`
            const messagesToSend = Util.splitMessage(msg)
            for(let messageToSend of messagesToSend) {
                message.channel.send(messageToSend)
            }
            
            }
            else if(method == "switch" || method == 'sw') {
                if (!args[0]) return message.reply(`incorrect args, do \`\`${global.conf.discord.prefix}help account\`\``)
                var nomCompte = args.shift()
                if (!global.conf.ed.accounts[nomCompte]) return message.reply(`This account doesn't exist, do \`\`${global.conf.discord.prefix}account list\`\` to show all the available accounts`)
                global.comptesParDefaut[message.author.id] = nomCompte
                saveComptesConf(JSON.stringify(global.comptesParDefaut))
                message.reply(`your active account is now ${nomCompte} :white_check_mark:`)
            }
            else message.reply(`incorrect args \`\`${global.conf.discord.prefix}help account\`\``)
        }
        else {
            if (global.comptesParDefaut[message.author.id]) message.reply(`Your current account is **${global.comptesParDefaut[message.author.id]}**`)
            else message.reply(`You have not selected an account, so the default account is ${global.conf.ed.defaultAccount}\ndo \`\`${global.conf.discord.prefix}account list\`\` to show all the available accounts`)
        }
        
    }
};