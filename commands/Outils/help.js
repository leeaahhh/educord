const { Util } = require('discord.js')

module.exports = {
	name: 'help',
	description: 'Gives all available commands or info about a specified command',
	aliases: ['commands'],
	cooldown: 5,
    usage : '<cmd>',
	execute(message, args) {
        const prefix = global.conf.discord.prefix
        var reply = [];
		const { commands } = message.client;

		if (!args.length) {
            reply.push('list of all cmds :');
            reply.push(commands.map(command => command.name).join(', '));
            reply.push(`\nSend \`${prefix}help [cmd]\` to have information about this command`);
            
            const messagesToSend = Util.splitMessage(reply.join('\n'))
            var firstMessage = true
            for(let messageToSend of messagesToSend) {
                if (firstMessage) {
                message.author.send(messageToSend)
                .then(() => {
                    if (message.channel.type === 'DM') return;
                    message.reply('check dms');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('enable your dms fucker');
                });
                firstMessage = false
                }
                else {
                    message.author.send(messageToSend)
                }
                
            }
            return
        
		}
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('invalid cmd');
        }

        reply.push(`**Name:** ${command.name}`);

        if (command.aliases) reply.push(`**Alias:** ${command.aliases.join(', ')}`);
        if (command.description) reply.push(`**Description:** ${command.description}`);
        if (command.usage) reply.push(`**Utilisation:** ${prefix}${command.name} ${command.usage}`);

        reply.push(`**Cooldown:** ${command.cooldown || 3} seconds`);
        reply = reply.join('\n')

        const messagesToSend = Util.splitMessage(reply)
            for(let messageToSend of messagesToSend) {
                message.channel.send(messageToSend)
            }

        
	},
};
