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
          var jourSemaine = ('Mardi');
          break;
        case 'Wednesday':
          var jourSemaine = ('Mercredi');
          break;
        case 'Thursday':
          var jourSemaine = ('Jeudi');
          break;
        case 'Friday':
          var jourSemaine = ('Vendredi');
          break;
        case 'Saturday':
          var jourSemaine = ('Samedi');
          break;
        case 'Sunday':
          var jourSemaine = ('Dimanche');
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
        return 'Janvier';
    case 'February':
        return 'Février';
    case 'March':
        return 'Mars';
    case 'April':
        return 'Avril';
    case 'May':
        return 'Mai';
    case 'June':
        return 'Juin';
    case 'July':
        return 'Juillet';
    case 'August':
        return 'Août';
    case 'September':
        return 'Septembre';
    case 'October':
        return 'Octobre';
    case 'November':
        return 'Novembre';
    case 'December':
        return 'Décembre';
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
                var cahierDeTexte = await account.gettimetable(cahierDeTexteArgs).catch(() => {
                    return message.reply('La date est invalide, merci de la fournir au format jj-mm-aaaa')
                });
            }
            else var cahierDeTexte = await account.gettimetable();
            
            if (cahierDeTexte.length == 0) message.channel.send('**Pas de devoirs à faire !** :partying_face:')
            else {
            var reponse =[];
            for(let t = 0; t<cahierDeTexte.length;t++){
                var dateRendu = new Date(cahierDeTexte[t].date)
                if (cahierDeTexte[t].job){
                    if (cahierDeTexte[t].test) var note = 'Oui'
                    else var note = 'Non'
                    if (cahierDeTexte[t].job.toReturnOnline) var aRendreEnligne = 'Oui'
                    else var aRendreEnligne = 'Non'
                    reponse.push(
                        new Discord.MessageEmbed()
                        .setColor('#2C95FF')
                        .setAuthor(`Pour le ${traduireJourSemaine(format(dateRendu,'EEEE'))} ${calcJourMois(dateRendu)} ${traduireMoisAnnee(format(dateRendu,'MMMM'))}`)
                        .setTitle(cahierDeTexte[t].subject.name)
                        .setDescription(cahierDeTexte[t].job.content.text)
                        .addFields(
                            {name:'Noté', value: note},
                            {name:'À rendre en ligne', value: aRendreEnligne},
                            {name:'Compte',value:compte}
                        )
                        .setFooter(`Travail donné le ${format(Date.parse(cahierDeTexte[t].job.givenAt),'dd/MM/yyyy')} par ${cahierDeTexte[t].teacher}`)
                        

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