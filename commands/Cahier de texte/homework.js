/* eslint-disable no-redeclare */
const EcoleDirecte = require("ecoledirecte.js");
const Discord = require('discord.js')
const format  = require("date-fns/format");
const { compteUtilisateur, splitEmbeds } = require('../../helpers/helpers')

function traduireJourSemaine(jour){
    switch (jour){
        case 'Monday':
          var jourSemaine = ('Monday');
          break;
        case 'Tuesday':
          var jourSemaine = ('Tuesday');
          break;
        case 'Wednesday':
          var jourSemaine = ('Wednesday');
          break;
        case 'Thursday':
          var jourSemaine = ('Thursday');
          break;
        case 'Friday':
          var jourSemaine = ('Friday');
          break;
        case 'Saturday':
          var jourSemaine = ('Saturday');
          break;
        case 'Sunday':
          var jourSemaine = ('Sunday');
          break;
      }
      return jourSemaine
}

function calcJourMois(date){
    switch (format(date,'d')){
      case '1':
        return '1st';
      default :
      return format(date,'d')
    }
  }

function traduireMoisAnnee(jour){
switch (jour){
    case 'January':
        return 'January';
    case 'February':
        return 'February';
    case 'March':
        return 'March';
    case 'April':
        return 'April';
    case 'May':
        return 'May';
    case 'June':
        return 'June';
    case 'July':
        return 'July';
    case 'August':
        return 'August';
    case 'September':
        return 'September';
    case 'October':
        return 'October';
    case 'November':
        return 'November';
    case 'December':
        return 'December';
    default :
        throw new error("in english pleas!!!!!");
}
}

module.exports = {
    name: "homework",
    aliases: ["hw"],
    description: "Gives homework",
    guildOnly: false,
    memberpermissions:"VIEW_CHANNEL",
    cooldown: 5,
    usage: "<account>(optional) <date> ( format : dd-mm-yyyy ,optional)",
    execute(message, args) {
        (async () => {
            var username = '';
            var password = '';
            var compte = '';
            if (args[0] && global.conf.ed.accounts[args[0]]){
                compte = args.shift()
                username = global.conf.ed.accounts[compte]['username']
                password = global.conf.ed.accounts[compte]['password']
            }
            else [username,password,compte] = compteUtilisateur(message.author.id)
            const session = new EcoleDirecte.Session(username,password);
            const account = await session.login().catch(err => {
                console.error(`This login did not go well.`);
                throw new Error(err);
            });

            if (args[0]) {
                var date = args[0].split('-')
                var cahierDeTexteArgs = { dates: [date[2],date[1],date[0]].join("-") }
                var cahierDeTexte = await account.getHomework(cahierDeTexteArgs).catch(() => {
                    return message.reply('invalid date format, please use dd-mm-aaaa')
                });
            }
            else var cahierDeTexte = await account.getHomework();
            
            if (cahierDeTexte.length == 0) message.channel.send('**no homework** <:eathand:808091409055481866>')
            else {
            var reponse =[];
            for(let t = 0; t<cahierDeTexte.length;t++){
                var dateRendu = new Date(cahierDeTexte[t].date)
                if (cahierDeTexte[t].job){
                    if (cahierDeTexte[t].test) var note = 'Yes'
                    else var note = 'No'
                    if (cahierDeTexte[t].job.toReturnOnline) var aRendreEnligne = 'Yes'
                    else var aRendreEnligne = 'No'
                    reponse.push(
                        new Discord.MessageEmbed()
                        .setColor('#2C95FF')
                        .setAuthor(`For ${traduireJourSemaine(format(dateRendu,'EEEE'))} ${calcJourMois(dateRendu)} ${traduireMoisAnnee(format(dateRendu,'MMMM'))}`)
                        .setTitle(cahierDeTexte[t].subject.name)
                        .setDescription(cahierDeTexte[t].job.content.text)
                        .addFields(
                            {name:'Rated', value: note},
                            {name:'To be returned online', value: aRendreEnligne},
                            {name:'Account',value:compte}
                        )
                        .setFooter(`Homework given on ${format(Date.parse(cahierDeTexte[t].job.givenAt),'dd/MM/yyyy')} by ${cahierDeTexte[t].teacher}`)
                        

                    )
                }
            }
            var embedsLists = splitEmbeds(reponse)
            for(let embedsList of embedsLists){
                message.channel.send({embeds : embedsList});
            }
            }
        })();
    },
};