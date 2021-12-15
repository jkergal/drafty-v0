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

//-----------------------------//
//----MSG ENTRIES + CHECKIN----//
//-----------------------------//


let scheduledPodsMessage = new cron.CronJob('00 30 19 * * 5', () => { 
    // for Cron : each " * " above means one parameter, 
    // from left to right : second 0-59, minute 0-59, hour 0-23, day of month 1-31, month 0-11, day of week 0-6
    // You can use "*" to don't use the parameter
    // Here, the Cron job is done every minutes with the "00" in first position (better to test and debug)

    const scheduledMessageDate = new Date();

    let podMondayDate = "<t:" + getTimestampSeconds(scheduledMessageDate, 1) + ":D>";
    let podMondayDateShort = "<t:" + getTimestampSeconds(scheduledMessageDate, 1) + ":d>";
    let podTuesdayDate = "<t:" + getTimestampSeconds(scheduledMessageDate, 2) + ":D>";
    let podWednesdayDate = "<t:" + getTimestampSeconds(scheduledMessageDate, 3) + ":D>";
    let podThursdayDate = "<t:" + getTimestampSeconds(scheduledMessageDate, 4) + ":D>";
    let podFridayDate = "<t:" + getTimestampSeconds(scheduledMessageDate, 5) + ":D>";
    let podSaturdayDate = "<t:" + getTimestampSeconds(scheduledMessageDate, 6) + ":D>";
    let podSundayDate = "<t:" + getTimestampSeconds(scheduledMessageDate, 7) + ":D>";
    let podSundayDateShort = "<t:" + getTimestampSeconds(scheduledMessageDate, 7) + ":d>";

    //----------VARIABLES TO CHANGE WHEN YOU CHANGE SERVER----------//

    // Serveur PERF LIMITE

        const channelEntries = client.channels.cache.get("684235805757145117"); // Change the channel ID for draft entries here
        const channelCheckIn1 = client.channels.cache.get("725725364726530159"); // Change the channel ID for pod 1 check-in here
        const channelCheckIn2 = client.channels.cache.get("725726906728710206"); // Change the channel ID for pod 2 check-in here
        const channelCheckInAsync = client.channels.cache.get("783154310653280256"); // Change the channel ID for asynchron pod check-in here
        const channelFonctionnement = client.channels.cache.get("769288446610636830"); // Change the channel ID of the channel you want to tag in your entries message
        const guild = client.guilds.cache.get("668478387123388426"); // Change your Discord server ID here

        const emojiMonday = guild.emojis.cache.get('911345759650209804'); // Change here and below the emojis IDs considering your server's emojis
        const emojiTuesday = guild.emojis.cache.get('911345759729881119');
        const emojiWednesday = guild.emojis.cache.get('911345759650209822');
        const emojiThursday = guild.emojis.cache.get('911345759767642173');
        const emojiFriday = guild.emojis.cache.get('911345759650218054');
        const emojiSaturday = guild.emojis.cache.get('911345759344017479');
        const emojiSunday = guild.emojis.cache.get('911345759398555669');

    //----------------------------------------//

    const scheduledMessageContent = `**- Ouverture des inscriptions pour la semaine du ${podMondayDateShort} au ${podSundayDateShort} -** \n\nPour vous inscrire réagissez à ce message avec vos jours de disponibilité : \n\n${emojiMonday} : Lundi ${podMondayDate} (20h) - Draft ${currentMtgFormat} \n${emojiTuesday} : Mardi ${podTuesdayDate} (20h) - Draft ${currentMtgFormat} \n${emojiWednesday} : Mercredi ${podWednesdayDate} (20h) - Draft ${currentMtgFormat} \n${emojiThursday} : Jeudi ${podThursdayDate} (20h) - Draft ${currentMtgFormat} \n${emojiFriday} : Vendredi ${podFridayDate} (20h30) - Draft ${currentMtgFormat} \n${emojiSaturday} : Samedi ${podSaturdayDate} + " (20h30) - Draft ${currentMtgFormat} \n${emojiSunday} : Dimanche ${podSundayDate} (20h) - Draft ${currentMtgFormat} \n:alarm_clock:  : Dimanche ${podSundayDate} : Draft Asynchrone (21h) - ${currentMtgFormat} \n\nDès lors qu'une table de 8 joueurs est complète, un message de check-in automatique sera posté dans le channel approprié. Vous serez alors tagués et invités à valider votre présence.\n\nLes joueurs inscrits supplémentaires (mais en nombre insuffisant pour constituer une POD) sont considérés comme prioritaires sur les remplacements éventuels (absence de check-in, désistement de dernière minute etc...).`

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

        let podsMessage = await sentMessage;
        const maxPodsEntries = 8;
        let podNumber = 0;


        function collectEntryReactions (emojiName, podDay, dayOfTheWeek, podNumber, hour, channel1, channel2) {
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
                            channel1.send(`------------ \n\nLa **TABLE ${podNumber} ** de ***${podDay} ${nextDayOfTheWeek} ${hour}*** a ses 8 joueurs ! \n- <@${usersIdTable[0].toString()}> \n- <@${usersIdTable[1].toString()}> \n- <@${usersIdTable[2].toString()}> \n- <@${usersIdTable[3].toString()}> \n- <@${usersIdTable[4].toString()}> \n- <@${usersIdTable[5].toString()}> \n- <@${usersIdTable[6].toString()}> \n- <@${usersIdTable[7].toString()}> \n\nValidez votre présence en cliquant sur la réaction ✅ en bas de ce message !`)
                            .then((sentMessage) => { 
                                sentMessage.react('✅')
                            });
                            console.log("✔️ Pod number " + podNumber + " is now full");
                            usersIdTable = [];
                            console.log("⚪️ Entries array for the Pod number " + podNumber + " successfully cleared : " +  usersIdTable);
                            return collectEntryReactions (emojiName, podDay, dayOfTheWeek, podNumber , channel1, channel2);
                        }

                        if (podNumber === 2) {
                            channel2.send(`------------ \n\nLa **TABLE ${podNumber} ** de ***${podDay} ${nextDayOfTheWeek} ${hour}*** a ses 8 joueurs ! \n- <@${usersIdTable[0].toString()}> \n- <@${usersIdTable[1].toString()}> \n- <@${usersIdTable[2].toString()}> \n- <@${usersIdTable[3].toString()}> \n- <@${usersIdTable[4].toString()}> \n- <@${usersIdTable[5].toString()}> \n- <@${usersIdTable[6].toString()}> \n- <@${usersIdTable[7].toString()}> \n\nValidez votre présence en cliquant sur la réaction ✅ en bas de ce message !`)
                            .then((sentMessage) => { 
                                sentMessage.react('✅')
                            });
                            console.log("✔️ Pod number " + podNumber + " is now full");
                            usersIdTable = [];
                            console.log("⚪️ Entries array for the Pod number " + podNumber + " successfully cleared : " +  usersIdTable);
                            return collectEntryReactions (emojiName, podDay, dayOfTheWeek, podNumber , channel1, channel2);
                        }

                    }

                    else {
                        podsMessage.channel.send(`------------ \n\n**ALERT - POD DU ${podDay} ${nextDayOfTheWeek} ${hour} :**\n\n 2 tables de pods ont déjà été gérées par votre serviteur dévoué Drafty. \n\nMalheureusement, pour cette **${podNumber}ème table maintenant complète**, vous allez devoir vous débrouiller comme des grands! Créez une catégorie TABLE POD-${podNumber} ainsi que les channels associés, puis postez un message de check-in un peu comme je le fais d'habitude !`)                    
                        return collectEntryReactions (emojiName, podDay, dayOfTheWeek, podNumber , channel1, channel2);
                    }

            });   
        }


        
        const collectMondayEntries = async (podNumber) => {
            collectEntryReactions ('l_letter', "LUNDI", 1, podNumber, "20h", channelCheckIn1, channelCheckIn2);
        }

        const collectTuesdayEntries = async (podNumber) => {
            collectEntryReactions ('m_letter', "MARDI", 2, podNumber, "20h", channelCheckIn1, channelCheckIn2); 
        }

        const collectWednesdayEntries = async (podNumber) => {
            collectEntryReactions ('w_letter', "MERCREDI", 3, podNumber, "20h", channelCheckIn1, channelCheckIn2); 
        }

        const collectThursdayEntries = async (podNumber) => {
            collectEntryReactions ('j_letter', "JEUDI", 4, podNumber, "20h", channelCheckIn1, channelCheckIn2); 
        }

        const collectFridayEntries = async (podNumber) => {
            collectEntryReactions ('v_letter', "VENDREDI", 5, podNumber, "20h30", channelCheckIn1, channelCheckIn2); 
        }

        const collectSaturdayEntries = async (podNumber) => {
            collectEntryReactions ('s_letter', "SAMEDI", 6, podNumber, "20h30", channelCheckIn1, channelCheckIn2);
        }

        const collectSundayEntries = async (podNumber) => {
            collectEntryReactions ('d_letter', "DIMANCHE", 7, podNumber, "20h", channelCheckIn1, channelCheckIn2);
        }

        const collectAnsyncEntries = async (podNumber) => {
            collectEntryReactions ('⏰', "DRAFT ASYNCHRONE DE DIMANCHE", 7, podNumber, "21h", channelCheckInAsync, channelCheckInAsync);
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