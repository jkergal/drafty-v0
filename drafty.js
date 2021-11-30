//-----------------------------//
//---------REQUISITES----------//
//-----------------------------//

const cron = require('cron');
require('dotenv').config(); // Create a .env file to specify your bot token and commands' prefix
const { Client, Intents } = require('discord.js');


//-----------------------------//
//-------DISCORD CONNEXION-----//
//-----------------------------//

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
client.once('ready', () => {
    console.log('IM SUPER READY YEA!')
})


//-----------------------------//
//----------VARIABLES----------//
//-----------------------------//

let currentMtgFormat = "VOW";


//-----------------------------//
//----MSG ENTRIES + CHECKIN----//
//-----------------------------//


let scheduledPodsMessage = new cron.CronJob('00 * * * * *', () => { 
    // for Cron : every " * " above mean one parameter, 
    // from left to right : second 0-59, minute 0-59, hour 0-23, day of month 1-31, month 0-11, day of week 0-6
    // You can use "*" to don't use the parameter
    // Here, the Cron job is done every minutes with the "00" in first position (better to test and debug)

    const messageDate = new Date();

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    function getTimestampSeconds(daysFromToday) {
        let ms= messageDate.addDays(daysFromToday);
        let sec= Math.floor((ms/1000));
        return sec;

    };

    let mondayDate = "<t:" + getTimestampSeconds(3) + ":D>";
    let mondayDateShort = "<t:" + getTimestampSeconds(3) + ":d>";
    let tuesdayDate = "<t:" + getTimestampSeconds(4) + ":D>";
    let wednesdayDate = "<t:" + getTimestampSeconds(5) + ":D>";
    let thursdayDate = "<t:" + getTimestampSeconds(6) + ":D>";
    let fridayDate = "<t:" + getTimestampSeconds(7) + ":D>";
    let saturdayDate = "<t:" + getTimestampSeconds(8) + ":D>";
    let sundayDate = "<t:" + getTimestampSeconds(9) + ":D>";
    let sundayDateShort = "<t:" + getTimestampSeconds(9) + ":d>";

    const channel = client.channels.cache.get("910686979828633611"); // Change the channel ID for your message here
    const guild = client.guilds.cache.get("910603170336624640"); // Change your Discord server ID here

    const emojiL = guild.emojis.cache.get('911267403072167966'); // Change here and below the emojis IDs considering your server's emojis
    const emojiM = guild.emojis.cache.get('911267403046998016');
    const emojiW = guild.emojis.cache.get('911267403084730418');
    const emojiJ = guild.emojis.cache.get('911267403046985738');
    const emojiV = guild.emojis.cache.get('911268283901177876');
    const emojiS = guild.emojis.cache.get('911267403034415114');
    const emojiD = guild.emojis.cache.get('911267403109912606');

    const msg = "**- Ouverture des inscriptions pour la semaine du " + mondayDateShort + " au " + sundayDateShort + "  -**\n\nPour vous inscrire réagissez à ce poste avec vos jours de disponibilité : \n\n:regional_indicator_l: : Lundi " + mondayDate + " (20h) - Draft " + currentMtgFormat + "\n:regional_indicator_m: : Mardi " + tuesdayDate + " (20h) - Draft " + currentMtgFormat + "\n:regional_indicator_w: : Mercredi " + wednesdayDate + " (20h) - Draft " + currentMtgFormat + "\n:regional_indicator_j: : Jeudi " + thursdayDate + " (20h) - Draft " + currentMtgFormat + "\n:regional_indicator_v: : Vendredi " + fridayDate + " (20h30) - Draft " + currentMtgFormat + "\n:regional_indicator_s: : Samedi " + saturdayDate + " (20h30) - Draft " + currentMtgFormat + "\n:regional_indicator_d: : Dimanche " + sundayDate + " (20h) - Draft " + currentMtgFormat + "\n:alarm_clock:  : Dimanche " + sundayDate + " : Draft Asynchrone (21h) - " + currentMtgFormat + "\n\nDès lors qu'une personne est le 8ème inscrit sur un créneau (ou 16ème pour un éventuel 2ème draft au même horaire), cette dernière DOIT lancer le message de Check-in dans le salon approprié selon le modèle indiqué dans <#911268701528002590> (ou prévenir un modérateur).\n\nLes joueurs inscrits supplémentaires (mais en nombre insuffisant pour constituer une POD) sont considérés comme prioritaires sur les remplacements éventuels (absence de check-in, désistement de dernière minute etc...)."

    channel.send(msg)
    .then(async (sentMessage) => { 
        sentMessage.react(emojiL)
        sentMessage.react(emojiM)
        sentMessage.react(emojiW)
        sentMessage.react(emojiJ)
        sentMessage.react(emojiV)
        sentMessage.react(emojiS)
        sentMessage.react(emojiD)
        sentMessage.react('⏰')

        let podsMessage = await sentMessage;
        const maxPodsEntries = 1;
        let podNumber = 0;

        const collectAlarm = async (podNumber) => {

            podNumber = podNumber + 1;
            let usersIdTable = [];

            const filter = (reaction, user) => {
                return ['⏰'].includes(reaction.emoji.name) && !user.bot;
            };
            
            const collector = podsMessage.createReactionCollector({ filter, max: maxPodsEntries, time: 950400000 }); // "time" -> la collecte d'inscriptions s'arrête 11 jours plus tard
            
            collector.on('collect', (reaction, user) => {
                usersIdTable.push(`${user.id}`);
                console.log(`${user.tag} registered to the pod : ${reaction.emoji.name}`);
            });
            
            collector.on('end', (collected, reason) => {
              if (reason === 'limit')
                podsMessage.channel.send("------------\n\n**UPDATE :** \n\nLa **TABLE " + podNumber + "** Asynchrone de ***Dimanche prochain*** a ses 2 joueurs : \n\n▶️ début des inscriptions pour une table supplémentaire. \n\n" + "<@" + usersIdTable[0].toString() + "> , " + "veuillez valider votre présence dans le message de check-in.\n\n------------");
                console.log("Pod number " + podNumber + " is now full");
                usersIdTable = [];
                console.log("Entries array for the Pod number " + podNumber + " successfully cleared : " +  usersIdTable);
                return collectAlarm(podNumber);
            });    

        }

        const collectLLetter = async (podNumber) => {

            podNumber = podNumber + 1;
            let usersIdTable = [];
            
            const filter = (reaction, user) => {
                return ['l_letter'].includes(reaction.emoji.name) && !user.bot;
            };
            
            const collector = podsMessage.createReactionCollector({ filter, max: maxPodsEntries, time: 950400000 }); // "time" -> la collecte d'inscriptions s'arrête 11 jours plus tard
            
            collector.on('collect', (reaction, user) => {
                usersIdTable.push(`${user.id}`);
                console.log(`${user.tag} registered to the pod : ${reaction.emoji.name}`);
            });
            
            collector.on('end', (collected, reason) => {
              if (reason === 'limit')
                podsMessage.channel.send("------------\n\n**UPDATE :** \n\nLa **TABLE " + podNumber + "** de ***Lundi prochain*** a ses 8 joueurs : \n\n▶️ début des inscriptions pour une table supplémentaire.\n\n" + "<@" + usersIdTable[0].toString() + "> , " + "veuillez valider votre présence dans le message de check-in.\n\n------------");
                console.log("Pod number " + podNumber + " is now full");
                usersIdTable = [];
                console.log("Entries array for the Pod number " + podNumber + " successfully cleared : " +  usersIdTable);
                return collectLLetter(podNumber);
            });   

        }

    collectAlarm (podNumber);
    collectLLetter (podNumber);

    console.log('Scheduling cron message just worked')

    })

});

scheduledPodsMessage.start()


//-----------------------------//
//-------COMMANDS ENGINE-------//
//-----------------------------//

// client.on('message', ...); // When we'll want to set up some chat commands


//-----------------------------//
//--------CLIENT LOGIN---------//
//-----------------------------//

client.login(process.env.DISCORD_TOKEN);