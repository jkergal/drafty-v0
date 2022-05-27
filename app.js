//-----------------------------//
//---------DEPENDECIES---------//
//-----------------------------//

const cron = require('cron');
require('dotenv').config();
const { Client, Intents } = require('discord.js');
// const getDocs = require('firebase-admin')
const db = require('./db')
// const { doc, setDoc } = require('firebase-admin/firestore')

//-----------------------------//
//-------DISCORD CLIENT--------//
//-----------------------------//

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

//-----------------------------//
//-------------VARS------------//
//-----------------------------//

const currentMtgFormat = "VOW";

const maxPodsEntries = 8;
let podNumber = 0;

let lastWeekCollection

const getLastWeekCollection = async() => {
    const lastFirestoreWeekCollection = await db.collection("pods-weeks-entries").orderBy("scheduledMessageDate", "desc").limit(1).get()

    lastFirestoreWeekCollection.forEach(doc => {
        scheduledMessageDate = new Date(doc.data().scheduledMessageDate.seconds * 1000)
        console.log(scheduledMessageDate)

        return lastWeekCollection = {
            id : doc.id,
            data : doc.data()
        } 
      });
}

let scheduledMessageDate

let podMondayDate
let podMondayDateShort
let podTuesdayDate
let podWednesdayDate
let podThursdayDate
let podFridayDate
let podSaturdayDate
let podSundayDate
let podSundayDateShort

let podDiscordMondayDate
let podDiscordMondayDateShort
let podDiscordTuesdayDate
let podDiscordWednesdayDate
let podDiscordThursdayDate
let podDiscordFridayDate
let podDiscordSaturdayDate
let podDiscordSundayDate
let podDiscordSundayDateShort

//----------VARIABLES TO CHANGE WHEN YOU CHANGE SERVER----------//

// Serveur JK 

let channelEntries
let channelCheckIn1
let channelCheckIn2
let channelCheckInAsync
// let channelFonctionnement
let guild

let emojiMonday
let emojiTuesday
let emojiWednesday
let emojiThursday
let emojiFriday
let emojiSaturday
let emojiSunday

//----------------------------------------//


//-----------------------------//
//-----GLOBAL DATES ENGINE-----//
//-----------------------------//

// To put updated Timestamps in Discord messages


function getTimestampSeconds(date, dayOfWeek) {

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    
    Date.prototype.getWeek = function (dowOffset) { // dowOffset : 1-7 (Monday - Sunday), if in your country weeks begin with Monday, choose 1
        
            dowOffset = typeof(dowOffset) == 'number' ? dowOffset : 0; //default dowOffset to zero
            var newYear = new Date(this.getFullYear(),0,1);
            var day = newYear.getDay() - dowOffset; //the day of week the year begins on
            day = (day >= 0 ? day : day + 7);
            var daynum = Math.floor((this.getTime() - newYear.getTime() - 
            (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
            var weeknum;
            //if the year starts before the middle of a week
            if(day < 4) {
                weeknum = Math.floor((daynum+day-1)/7) + 1;
                if(weeknum > 52) {
                    nYear = new Date(this.getFullYear() + 1,0,1);
                    nday = nYear.getDay() - dowOffset;
                    nday = nday >= 0 ? nday : nday + 7;
                    /*if the next year starts before the middle of
                      the week, it is week #1 of that year*/
                    weeknum = nday < 4 ? 1 : 53;
                }
            }
            else {
                weeknum = Math.floor((daynum+day-1)/7);
            }
            return weeknum;
        };
    

    function getNextDayOfWeek(date, dayOfWeek) {
    
        let resultDate = new Date(date.getTime());
    
        resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    
        if ( date.getDate() === resultDate.getDate() && date.getDay() === resultDate.getDay() || date.getWeek(1) === resultDate.getWeek(1) ) {
            resultDate = resultDate.addDays(7); 
            return resultDate;    
        }
    
        else {
            return resultDate;
        }
    
    }

    let ms= getNextDayOfWeek(date, dayOfWeek)

    let sec= Math.floor((ms/1000));
    return sec;       

};

function getDiscordTimestamp(date) {
    return date = "<t:" + date + ":D>";
}

function getShortDiscordTimestamp(date) {
    return date = "<t:" + date + ":d>";
}

// function padTo2Digits(num) {
//     return num.toString().padStart(2, '0');
//   }

// function formatDate(date) {
//     return [
//       padTo2Digits(date.getDate()),
//       padTo2Digits(date.getMonth() + 1),
//       date.getFullYear(),
//     ].join('/');
//   }

const getDayOfEmoji = (reactEmojiName) => {
    let firebasePodDay

    switch(reactEmojiName) {
        case 'l_letter' : firebasePodDay = "monday"
            break
        case 'm_letter' : firebasePodDay = "tuesday"
            break
        case 'w_letter' : firebasePodDay = "wednesday"
            break
        case 'j_letter' : firebasePodDay = "thursday"
            break
        case 'v_letter' : firebasePodDay = "friday"
            break
        case 's_letter' : firebasePodDay = "saturday"
            break
        case 'd_letter' : firebasePodDay = "sunday"
            break
        case '⏰' : firebasePodDay = "asyncPod"
            break
    }

    return firebasePodDay
}

//------------------------------------------------//
//---------------COLLECT FUNCTION-----------------//
//------------------------------------------------//


  function collectEntryReactions (emojiName, podDay, dayOfTheWeek, podNumber, hour, channel1, channel2, podDiscordTimestamp, podsMessage, sentMessage) {
    podNumber = podNumber + 1;
    let usersIdTable = [];

    const filter = (reaction, user) => {
        return [emojiName].includes(reaction.emoji.name) && user.id != sentMessage.author.id;
    };
    
    const collector = sentMessage.createReactionCollector({ filter, max: maxPodsEntries, time: 950400000, dispose: true }); // "time" -> la collecte d'inscriptions s'arrête 11 jours plus tard
    
    collector.on('collect', (reaction, user) => {
        usersIdTable.push(
            {
                "username" : user.username,
                "userId" : user.id
            }
        );

        db.collection('pods-weeks-entries').doc(scheduledMessageDate.toString()).update(
            {
                [getDayOfEmoji(reaction.emoji.name)]: usersIdTable
            }
        );

        console.log(`➕ ${user.tag} registered to the pod : ${reaction.emoji.name}`);
        console.log(usersIdTable);
    });

    collector.on('remove', (reaction, user) => {
        console.log(`➖ ${user.tag} removed the reaction ${reaction.emoji.name}`);
        usersIdTable = usersIdTable.filter(userId => userId != user.id);
        console.log(usersIdTable);
    });
    
    collector.on('end', (collected, reason) => {

        if (reason === 'limit')

            if (podNumber <= 2) {

                if (podNumber === 1) {
                    channel1.send(`------------ \n\nLa **TABLE ${podNumber} ** de ***${podDay} ${podDiscordTimestamp} ${hour}*** a ses 8 joueurs ! \n- <@${usersIdTable[0].userId.toString()}> \n- <@${usersIdTable[1].userId.toString()}> \n- <@${usersIdTable[2].userId.toString()}> \n- <@${usersIdTable[3].userId.toString()}> \n- <@${usersIdTable[4].userId.toString()}> \n- <@${usersIdTable[5].userId.toString()}> \n- <@${usersIdTable[6].userId.toString()}> \n- <@${usersIdTable[7].userId.toString()}> \n\nValidez votre présence en cliquant sur la réaction ✅ en bas de ce message !`)
                    .then((sentMessage) => { 
                        sentMessage.react('✅')
                    });
                    console.log("✔️ Pod number " + podNumber + " is now full");
                    usersIdTable = [];
                    console.log("⚪️ Entries array for the Pod number " + podNumber + " successfully cleared : " +  usersIdTable);
                    return collectEntryReactions (emojiName, podDay, dayOfTheWeek, podNumber, hour , channel1, channel2, podDiscordTimestamp, podsMessage, sentMessage);
                }

                if (podNumber === 2) {
                    channel2.send(`------------ \n\nLa **TABLE ${podNumber} ** de ***${podDay} ${podDiscordTimestamp} ${hour}*** a ses 8 joueurs ! \n- <@${usersIdTable[0].userId.toString()}> \n- <@${usersIdTable[1].userId.toString()}> \n- <@${usersIdTable[2].userId.toString()}> \n- <@${usersIdTable[3].userId.toString()}> \n- <@${usersIdTable[4].userId.toString()}> \n- <@${usersIdTable[5].userId.toString()}> \n- <@${usersIdTable[6].userId.toString()}> \n- <@${usersIdTable[7].userId.toString()}> \n\nValidez votre présence en cliquant sur la réaction ✅ en bas de ce message !`)
                    .then((sentMessage) => { 
                        sentMessage.react('✅')
                    });
                    console.log("✔️ Pod number " + podNumber + " is now full");
                    usersIdTable = [];
                    console.log("⚪️ Entries array for the Pod number " + podNumber + " successfully cleared : " +  usersIdTable);
                    return collectEntryReactions (emojiName, podDay, dayOfTheWeek, podNumber, hour , channel1, channel2, podDiscordTimestamp);
                }

            }

            else {
                podsMessage.channel.send(`------------ \n\n**ALERT - POD DU ${podDay} ${podDiscordTimestamp} ${hour} :**\n\n 2 tables de pods ont déjà été gérées par votre serviteur dévoué Drafty. \n\nMalheureusement, pour cette **${podNumber}ème table maintenant complète**, vous allez devoir vous débrouiller comme des grands! Créez une catégorie TABLE POD-${podNumber} ainsi que les channels associés, puis postez un message de check-in un peu comme je le fais d'habitude !`)                    
                return collectEntryReactions (emojiName, podDay, dayOfTheWeek, podNumber, hour , channel1, channel2, podDiscordTimestamp);
            }

    });   
}



const collectMondayEntries = async (podNumber, podsMessage, sentMessage) => {
    collectEntryReactions ('l_letter', "LUNDI", 1, podNumber, "20h", channelCheckIn1, channelCheckIn2, podDiscordMondayDate, podsMessage, sentMessage);
}

const collectTuesdayEntries = async (podNumber, podsMessage, sentMessage) => {
    collectEntryReactions ('m_letter', "MARDI", 2, podNumber, "20h", channelCheckIn1, channelCheckIn2, podDiscordTuesdayDate, podsMessage, sentMessage); 
}

const collectWednesdayEntries = async (podNumber, podsMessage, sentMessage) => {
    collectEntryReactions ('w_letter', "MERCREDI", 3, podNumber, "20h", channelCheckIn1, channelCheckIn2, podDiscordWednesdayDate, podsMessage, sentMessage); 
}

const collectThursdayEntries = async (podNumber, podsMessage, sentMessage) => {
    collectEntryReactions ('j_letter', "JEUDI", 4, podNumber, "20h", channelCheckIn1, channelCheckIn2, podDiscordThursdayDate, podsMessage, sentMessage); 
}

const collectFridayEntries = async (podNumber, podsMessage, sentMessage) => {
    collectEntryReactions ('v_letter', "VENDREDI", 5, podNumber, "20h30", channelCheckIn1, channelCheckIn2, podDiscordFridayDate, podsMessage, sentMessage); 
}

const collectSaturdayEntries = async (podNumber, podsMessage, sentMessage) => {
    collectEntryReactions ('s_letter', "SAMEDI", 6, podNumber, "20h30", channelCheckIn1, channelCheckIn2, podDiscordSaturdayDate, podsMessage, sentMessage);
}

const collectSundayEntries = async (podNumber, podsMessage, sentMessage) => {
    collectEntryReactions ('d_letter', "DIMANCHE", 7, podNumber, "20h", channelCheckIn1, channelCheckIn2, podDiscordSundayDate, podsMessage, sentMessage);
}

const collectAnsyncEntries = async (podNumber, podsMessage, sentMessage) => {
    collectEntryReactions ('⏰', "DRAFT ASYNCHRONE DE DIMANCHE", 7, podNumber, "21h", channelCheckInAsync, channelCheckInAsync, podDiscordSundayDate, podsMessage, sentMessage);
}


//------------------------------------------------//
//-------RE-START LAST ENTRIES COLLECTION---------//
//------------------------------------------------//

async function restartLastEntriesCollection (podNumber) {
    await getLastWeekCollection()
    console.log(lastWeekCollection.data.scheduledMessageId)

    channelEntries.messages.fetch(lastWeekCollection.data.scheduledMessageId)
        .then(message => {
            collectMondayEntries(podNumber, message, message);
            collectTuesdayEntries(podNumber, message, message);
            collectWednesdayEntries(podNumber, message, message);
            collectThursdayEntries(podNumber, message, message);
            collectFridayEntries(podNumber, message, message);
            collectSaturdayEntries(podNumber, message, message);
            collectSundayEntries(podNumber, message, message);
            collectAnsyncEntries (podNumber, message, message);
        })
}


//-----------------------------//
//----MSG ENTRIES + CHECKIN----//
//-----------------------------//


let scheduledPodsMessage = new cron.CronJob('00 10 * * * *', () => { 
    // for Cron : each " * " above means one parameter, 
    // from left to right : second 0-59, minute 0-59, hour 0-23, day of month 1-31, month 0-11, day of week 0-6
    // You can use "*" to don't use the parameter
    // Here, the Cron job is done every minutes with the "00" in first position (better to test and debug)

    scheduledMessageDate = new Date();
    // formatedMessageDate = formatDate(scheduledMessageDate).replaceAll('/', '-')

    podMondayDate = getTimestampSeconds(scheduledMessageDate, 1);
    podMondayDateShort = getTimestampSeconds(scheduledMessageDate, 1);
    podTuesdayDate = getTimestampSeconds(scheduledMessageDate, 2);
    podWednesdayDate = getTimestampSeconds(scheduledMessageDate, 3);
    podThursdayDate = getTimestampSeconds(scheduledMessageDate, 4);
    podFridayDate = getTimestampSeconds(scheduledMessageDate, 5);
    podSaturdayDate = getTimestampSeconds(scheduledMessageDate, 6);
    podSundayDate = getTimestampSeconds(scheduledMessageDate, 7);
    podSundayDateShort = getTimestampSeconds(scheduledMessageDate, 7);

    podDiscordMondayDate = getDiscordTimestamp(podMondayDate);
    podDiscordMondayDateShort = getShortDiscordTimestamp(podMondayDateShort);
    podDiscordTuesdayDate = getDiscordTimestamp(podTuesdayDate);
    podDiscordWednesdayDate = getDiscordTimestamp(podWednesdayDate);
    podDiscordThursdayDate = getDiscordTimestamp(podThursdayDate);
    podDiscordFridayDate = getDiscordTimestamp(podFridayDate);
    podDiscordSaturdayDate = getDiscordTimestamp(podSaturdayDate);
    podDiscordSundayDate = getDiscordTimestamp(podSundayDate);
    podDiscordSundayDateShort = getShortDiscordTimestamp(podSundayDateShort);

    const scheduledMessageContent = `**- Ouverture des inscriptions pour la semaine du ${podDiscordMondayDateShort} au ${podDiscordSundayDateShort} -** \n\nPour vous inscrire réagissez à ce message avec vos jours de disponibilité : \n\n${emojiMonday} : Lundi ${podDiscordMondayDate} (20h) - Draft ${currentMtgFormat} \n${emojiTuesday} : Mardi ${podDiscordTuesdayDate} (20h) - Draft ${currentMtgFormat} \n${emojiWednesday} : Mercredi ${podDiscordWednesdayDate} (20h) - Draft ${currentMtgFormat} \n${emojiThursday} : Jeudi ${podDiscordThursdayDate} (20h) - Draft ${currentMtgFormat} \n${emojiFriday} : Vendredi ${podDiscordFridayDate} (20h30) - Draft ${currentMtgFormat} \n${emojiSaturday} : Samedi ${podDiscordSaturdayDate} + " (20h30) - Draft ${currentMtgFormat} \n${emojiSunday} : Dimanche ${podDiscordSundayDate} (20h) - Draft ${currentMtgFormat} \n:alarm_clock:  : Dimanche ${podDiscordSundayDate} : Draft Asynchrone (21h) - ${currentMtgFormat} \n\nDès lors qu'une table de 8 joueurs est complète, un message de check-in automatique sera posté dans le channel approprié. Vous serez alors tagués et invités à valider votre présence.\n\nLes joueurs inscrits supplémentaires (mais en nombre insuffisant pour constituer une POD) sont considérés comme prioritaires sur les remplacements éventuels (absence de check-in, désistement de dernière minute etc...).`

    channelEntries.send(scheduledMessageContent)
    .then(async (sentMessage) => { 
        sentMessage.react(emojiMonday)
        sentMessage.react(emojiTuesday)
        sentMessage.react(emojiWednesday)
        sentMessage.react(emojiThursday)
        sentMessage.react(emojiFriday)
        sentMessage.react(emojiSaturday)
        sentMessage.react(emojiSunday)
        sentMessage.react('⏰')

        const firestoreWeekCollection = 
        {   
            scheduledMessageDate: scheduledMessageDate,
            scheduledMessageId: sentMessage.id,
            monday: {},
            tuesday: {},
            wednesday: {},
            thursday: {},
            friday: {},
            saturday: {},
            sunday: {},
            asyncPod: {}
        }

        console.log(scheduledMessageDate)
        const res = await db.collection('pods-weeks-entries').doc(scheduledMessageDate.toString()).set(firestoreWeekCollection);

        let podsMessage = await sentMessage;

        collectMondayEntries(podNumber, podsMessage, sentMessage);
        collectTuesdayEntries(podNumber, podsMessage, sentMessage);
        collectWednesdayEntries(podNumber, podsMessage, sentMessage);
        collectThursdayEntries(podNumber, podsMessage, sentMessage);
        collectFridayEntries(podNumber, podsMessage, sentMessage);
        collectSaturdayEntries(podNumber, podsMessage, sentMessage);
        collectSundayEntries(podNumber, podsMessage, sentMessage);
        collectAnsyncEntries (podNumber, podsMessage, sentMessage);

        console.log('🆗 Scheduling cron message just worked')

    })

});

client.once('ready', async () => {
    console.log('IM SUPER READY YEA!')

    // Serveur JK 
    channelEntries = client.channels.cache.get("910686979828633611"); // Change the channel ID for your message here
    channelCheckIn1 = client.channels.cache.get("915042199270465626"); // Change the channel ID for pod 1 check-in here
    channelCheckIn2 = client.channels.cache.get("915674849370853386"); // Change the channel ID for pod 2 check-in here
    channelCheckInAsync = client.channels.cache.get("915674925690392587"); // Change the channel ID for asynchron pod check-in here
    // const channelFonctionnement = client.channels.cache.get("911268701528002590"); // Change the channel ID of the channel you want to tag in your entries message
    guild = client.guilds.cache.get("910603170336624640"); // Change your Discord server ID here 

    emojiMonday = guild.emojis.cache.get('911267403072167966'); // Change here and below the emojis IDs considering your server's emojis
    emojiTuesday = guild.emojis.cache.get('911267403046998016');
    emojiWednesday = guild.emojis.cache.get('911267403084730418');
    emojiThursday = guild.emojis.cache.get('911267403046985738');
    emojiFriday = guild.emojis.cache.get('911268283901177876');
    emojiSaturday = guild.emojis.cache.get('911267403034415114');
    emojiSunday = guild.emojis.cache.get('911267403109912606');

    // console.log(emojiMonday)
    restartLastEntriesCollection(podNumber)
    scheduledPodsMessage.start()
})


//-----------------------------//
//-------COMMANDS ENGINE-------//
//-----------------------------//

// client.on('message', ...); // When we'll want to set up some chat commands


//-----------------------------//
//--------CLIENT LOGIN---------//
//-----------------------------//

client.login(process.env.DISCORD_TOKEN);