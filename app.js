//-----------------------------//
//---------DEPENDECIES---------//
//-----------------------------//

const cron = require('cron');
require('dotenv').config();
const { Client, Intents } = require('discord.js');
const db = require('./db')
// const { doc, setDoc } = require('firebase-admin/firestore')


//-----------------------------//
//-------DISCORD CONNEXION-----//
//-----------------------------//

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
client.once('ready', () => {
    console.log('IM SUPER READY YEA!')
})


//-----------------------------//
//-------------VARS------------//
//-----------------------------//

const currentMtgFormat = "VOW";


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

//-----------------------------//
//----MSG ENTRIES + CHECKIN----//
//-----------------------------//


let scheduledPodsMessage = new cron.CronJob('00 * * * * 5', () => { 
    // for Cron : each " * " above means one parameter, 
    // from left to right : second 0-59, minute 0-59, hour 0-23, day of month 1-31, month 0-11, day of week 0-6
    // You can use "*" to don't use the parameter
    // Here, the Cron job is done every minutes with the "00" in first position (better to test and debug)

    const scheduledMessageDate = new Date();

    let podMondayDate = getTimestampSeconds(scheduledMessageDate, 1);
    let podMondayDateShort = getTimestampSeconds(scheduledMessageDate, 1);
    let podTuesdayDate = getTimestampSeconds(scheduledMessageDate, 2);
    let podWednesdayDate = getTimestampSeconds(scheduledMessageDate, 3);
    let podThursdayDate = getTimestampSeconds(scheduledMessageDate, 4);
    let podFridayDate = getTimestampSeconds(scheduledMessageDate, 5);
    let podSaturdayDate = getTimestampSeconds(scheduledMessageDate, 6);
    let podSundayDate = getTimestampSeconds(scheduledMessageDate, 7);
    let podSundayDateShort = getTimestampSeconds(scheduledMessageDate, 7);

    let podDiscordMondayDate = getDiscordTimestamp(podMondayDate);
    let podDiscordMondayDateShort = getShortDiscordTimestamp(podMondayDateShort);
    let podDiscordTuesdayDate = getDiscordTimestamp(podTuesdayDate);
    let podDiscordWednesdayDate = getDiscordTimestamp(podWednesdayDate);
    let podDiscordThursdayDate = getDiscordTimestamp(podThursdayDate);
    let podDiscordFridayDate = getDiscordTimestamp(podFridayDate);
    let podDiscordSaturdayDate = getDiscordTimestamp(podSaturdayDate);
    let podDiscordSundayDate = getDiscordTimestamp(podSundayDate);
    let podDiscordSundayDateShort = getShortDiscordTimestamp(podSundayDateShort);

    //----------VARIABLES TO CHANGE WHEN YOU CHANGE SERVER----------//

    // Serveur JK 

    const channelEntries = client.channels.cache.get("910686979828633611"); // Change the channel ID for your message here
    const channelCheckIn1 = client.channels.cache.get("915042199270465626"); // Change the channel ID for pod 1 check-in here
    const channelCheckIn2 = client.channels.cache.get("915674849370853386"); // Change the channel ID for pod 2 check-in here
    const channelCheckInAsync = client.channels.cache.get("915674925690392587"); // Change the channel ID for asynchron pod check-in here
    const channelFonctionnement = client.channels.cache.get("911268701528002590"); // Change the channel ID of the channel you want to tag in your entries message
    const guild = client.guilds.cache.get("910603170336624640"); // Change your Discord server ID here 

    const emojiMonday = guild.emojis.cache.get('911267403072167966'); // Change here and below the emojis IDs considering your server's emojis
    const emojiTuesday = guild.emojis.cache.get('911267403046998016');
    const emojiWednesday = guild.emojis.cache.get('911267403084730418');
    const emojiThursday = guild.emojis.cache.get('911267403046985738');
    const emojiFriday = guild.emojis.cache.get('911268283901177876');
    const emojiSaturday = guild.emojis.cache.get('911267403034415114');
    const emojiSunday = guild.emojis.cache.get('911267403109912606');

    //----------------------------------------//

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

        const data = {
            name: 'Los Angeles',
            state: 'CA',
            country: 'USA'
          };

        const res = await db.collection('pods-weeks-entries').doc(scheduledMessageDate.toString()).set(data);
        console.log(res)

        let podsMessage = await sentMessage;
        const maxPodsEntries = 8;
        let podNumber = 0;


        function collectEntryReactions (emojiName, podDay, dayOfTheWeek, podNumber, hour, channel1, channel2, podDiscordTimestamp) {
            podNumber = podNumber + 1;
            let usersIdTable = [];

            const filter = (reaction, user) => {
                return [emojiName].includes(reaction.emoji.name) && user.id != sentMessage.author.id;
            };
            
            const collector = podsMessage.createReactionCollector({ filter, max: maxPodsEntries, time: 950400000, dispose: true }); // "time" -> la collecte d'inscriptions s'arrête 11 jours plus tard
            
            collector.on('collect', (reaction, user) => {
                usersIdTable.push(`${user.id}`);
                console.log(`➕ ${user.tag} registered to the pod : ${reaction.emoji.name}`);
                console.log(usersIdTable);
            });

            collector.on('remove', (reaction, user) => {
                console.log(`➖ ${user.tag} removed the reaction ${reaction.emoji.name}`);
                usersIdTable = usersIdTable.filter(userId => userId != user.id);
                console.log(usersIdTable);
            });
            
            collector.on('end', (collected, reason) => {
                const reactionDate = new Date();
                let nextDayOfTheWeek = "<t:" + getTimestampSeconds(reactionDate, dayOfTheWeek) + ":D>";


                if (reason === 'limit')

                    if (podNumber <= 2) {

                        if (podNumber === 1) {
                            channel1.send(`------------ \n\nLa **TABLE ${podNumber} ** de ***${podDay} ${podDiscordTimestamp} ${hour}*** a ses 8 joueurs ! \n- <@${usersIdTable[0].toString()}> \n- <@${usersIdTable[1].toString()}> \n- <@${usersIdTable[2].toString()}> \n- <@${usersIdTable[3].toString()}> \n- <@${usersIdTable[4].toString()}> \n- <@${usersIdTable[5].toString()}> \n- <@${usersIdTable[6].toString()}> \n- <@${usersIdTable[7].toString()}> \n\nValidez votre présence en cliquant sur la réaction ✅ en bas de ce message !`)
                            .then((sentMessage) => { 
                                sentMessage.react('✅')
                            });
                            console.log("✔️ Pod number " + podNumber + " is now full");
                            usersIdTable = [];
                            console.log("⚪️ Entries array for the Pod number " + podNumber + " successfully cleared : " +  usersIdTable);
                            return collectEntryReactions (emojiName, podDay, dayOfTheWeek, podNumber, hour , channel1, channel2, podDiscordTimestamp);
                        }

                        if (podNumber === 2) {
                            channel2.send(`------------ \n\nLa **TABLE ${podNumber} ** de ***${podDay} ${podDiscordTimestamp} ${hour}*** a ses 8 joueurs ! \n- <@${usersIdTable[0].toString()}> \n- <@${usersIdTable[1].toString()}> \n- <@${usersIdTable[2].toString()}> \n- <@${usersIdTable[3].toString()}> \n- <@${usersIdTable[4].toString()}> \n- <@${usersIdTable[5].toString()}> \n- <@${usersIdTable[6].toString()}> \n- <@${usersIdTable[7].toString()}> \n\nValidez votre présence en cliquant sur la réaction ✅ en bas de ce message !`)
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


        
        const collectMondayEntries = async (podNumber) => {
            collectEntryReactions ('l_letter', "LUNDI", 1, podNumber, "20h", channelCheckIn1, channelCheckIn2, podDiscordMondayDate);
        }

        const collectTuesdayEntries = async (podNumber) => {
            collectEntryReactions ('m_letter', "MARDI", 2, podNumber, "20h", channelCheckIn1, channelCheckIn2, podDiscordTuesdayDate); 
        }

        const collectWednesdayEntries = async (podNumber) => {
            collectEntryReactions ('w_letter', "MERCREDI", 3, podNumber, "20h", channelCheckIn1, channelCheckIn2, podDiscordWednesdayDate); 
        }

        const collectThursdayEntries = async (podNumber) => {
            collectEntryReactions ('j_letter', "JEUDI", 4, podNumber, "20h", channelCheckIn1, channelCheckIn2, podDiscordThursdayDate); 
        }

        const collectFridayEntries = async (podNumber) => {
            collectEntryReactions ('v_letter', "VENDREDI", 5, podNumber, "20h30", channelCheckIn1, channelCheckIn2, podDiscordFridayDate); 
        }

        const collectSaturdayEntries = async (podNumber) => {
            collectEntryReactions ('s_letter', "SAMEDI", 6, podNumber, "20h30", channelCheckIn1, channelCheckIn2, podDiscordSaturdayDate);
        }

        const collectSundayEntries = async (podNumber) => {
            collectEntryReactions ('d_letter', "DIMANCHE", 7, podNumber, "20h", channelCheckIn1, channelCheckIn2, podDiscordSundayDate);
        }

        const collectAnsyncEntries = async (podNumber) => {
            collectEntryReactions ('⏰', "DRAFT ASYNCHRONE DE DIMANCHE", 7, podNumber, "21h", channelCheckInAsync, channelCheckInAsync, podDiscordSundayDate);
        }

        collectMondayEntries(podNumber);
        collectTuesdayEntries(podNumber);
        collectWednesdayEntries(podNumber);
        collectThursdayEntries(podNumber);
        collectFridayEntries(podNumber);
        collectSaturdayEntries(podNumber);
        collectSundayEntries(podNumber);
        collectAnsyncEntries (podNumber);

        console.log('🆗 Scheduling cron message just worked')

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