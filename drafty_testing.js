//-----------------------------//
//-------DISCORD CONNEXION-----//
//-----------------------------//

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.once('ready', () => {
    console.log('IM SUPER READY YEA!')
})


//-----------------------------//
//-------ANY REQUIRES----------//
//-----------------------------//

const cron = require('cron');


//-----------------------------//
//-------VARIABLES-------------//
//-----------------------------//

let currentMtgFormat = "VOW";


//-----------------------------//
//-------DATES ENGINE----------//
//-----------------------------//

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


//-----------------------------//
//-------PODS MESSAGE----------//
//-----------------------------//

const msg = "**- Ouverture des inscriptions pour la semaine du " + mondayDateShort + " au " + sundayDateShort + "  -**\n\nPour vous inscrire réagissez à ce poste avec vos jours de disponibilité : \n\n:regional_indicator_l: : Lundi " + mondayDate + " (20h) - Draft " + currentMtgFormat + "\n:regional_indicator_m: : Mardi " + tuesdayDate + " (20h) - Draft " + currentMtgFormat + "\n:regional_indicator_w: : Mercredi " + wednesdayDate + " (20h) - Draft " + currentMtgFormat + "\n:regional_indicator_j: : Jeudi " + thursdayDate + " (20h) - Draft " + currentMtgFormat + "\n:regional_indicator_v: : Vendredi " + fridayDate + " (20h30) - Draft " + currentMtgFormat + "\n:regional_indicator_s: : Samedi " + saturdayDate + " (20h30) - Draft " + currentMtgFormat + "\n:regional_indicator_d: : Dimanche " + sundayDate + " (20h) - Draft " + currentMtgFormat + "\n:alarm_clock:  : Dimanche " + sundayDate + " : Draft Asynchrone (21h) - " + currentMtgFormat + "\n\nDès lors qu'une personne est le 8ème inscrit sur un créneau (ou 16ème pour un éventuel 2ème draft au même horaire), cette dernière DOIT lancer le message de Check-in dans le salon approprié selon le modèle indiqué dans <#911268701528002590> (ou prévenir un modérateur).\n\nLes joueurs inscrits supplémentaires (mais en nombre insuffisant pour constituer une POD) sont considérés comme prioritaires sur les remplacements éventuels (absence de check-in, désistement de dernière minute etc...).";

// function reactMonday() {
//     sentMessage.react(guild.emojis.cache.get('911267403072167966'))
//     collector.on('end', (collected, reason) => {
//         // reactions are no longer collected
//         // if the 👍 emoji is clicked the MAX_REACTIONS times
//         if (reason === 'limit')
//           return message.channel.send(`We've just reached the maximum of ${MAX_REACTIONS} reactions.`);
//       });
// }

let scheduledPodsMessage = new cron.CronJob('00 * * * * *', () => { 
    // for Cron : every " * " above mean one parameter, 
    // from left to right : second 0-59, minute 0-59, hour 0-23, day of month 1-31, month 0-11, day of week 0-6
    // You can use "*" to don't use the parameter

    const channel = client.channels.cache.get("910686979828633611");
    const guild = client.guilds.cache.get("910603170336624640");

    const filter = (reaction, user) => {
        return reaction.emoji.name === '⏰' && user.id === message.author.id;
    };

    channel.send(msg)
    .then(sentMessage => {
        sentMessage.react(guild.emojis.cache.get('911267403072167966'))
        sentMessage.react(guild.emojis.cache.get('911267403046998016'))
        sentMessage.react(guild.emojis.cache.get('911267403084730418'))
        sentMessage.react(guild.emojis.cache.get('911267403046985738'))
        sentMessage.react(guild.emojis.cache.get('911268283901177876'))
        sentMessage.react(guild.emojis.cache.get('911267403034415114'))
        sentMessage.react(guild.emojis.cache.get('911267403109912606'))
        sentMessage.react('⏰')
        
        // sentMessage.awaitReactions({ filter })
        //     .then(collected => console.log(collected.size))
        //     .catch(collected => {
        //         console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
        //     })
    })

    // .then(msg => {
    //     const collector = msg.createReactionCollector();
    //         collector.on('collect', i => {
    //             if (i.users.length === 2){
    //                 console.log("Pod table : full. Check-in message sent.")
    //             }
    //             // Or other code to run... can also call a proper function rather then this arrowed one 
    //         })
    // })

    
    console.log('Scheduling cron message just worked')
});

scheduledPodsMessage.start()


// client.on('message', async (message) => {
//     const MAX_REACTIONS = 2;
  
//     if (command === 'react') {
//       try {
//         // send a message and wait for it to be sent
//         const sentMessage = await message.channel.send('React to this!');
  
//         // react to the sent message
//         await sentMessage.react('👍');
  
//         // set up a filter to only collect reactions with the 👍 emoji
//         // and don't count the bot's reaction
//         const filter = (reaction, user) => reaction.emoji.name === '👍' && !user.bot;
  
//         // set up the collecrtor with the MAX_REACTIONS
        // const collector = sentMessage.createReactionCollector(filter, {
        //   max: MAX_REACTIONS,
        // });
  
        // collector.on('collect', (reaction) => {
        //   // in case you want to do something when someone reacts with 👍
        //   console.log(`Collected a new ${reaction.emoji.name} reaction`);
        // });
  
        // // fires when the time limit or the max is reached
        // collector.on('end', (collected, reason) => {
        //   // reactions are no longer collected
        //   // if the 👍 emoji is clicked the MAX_REACTIONS times
        //   if (reason === 'limit')
        //     return message.channel.send(`We've just reached the maximum of ${MAX_REACTIONS} reactions.`);
        // });
//       } catch (error) {
//         // "handle" errors
//         console.log(error);
//       }



//-----------------------------//
//-------COMMANDS ENGINE-------//
//-----------------------------//

// client.on('message', ...); // When we'll want to set up some chat commands

client.login('OTEwNjE2NjUxODQ0NzEwNDEy.YZVb2A.yqyQFx9S1JULqOwMpQW2DPjfuq0');