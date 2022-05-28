const cron = require('cron');
require('dotenv').config();
const { Client, Intents } = require('discord.js');
const db = require('./db')
const getRightValue = require('./utils/getRightValue')
const getDate = require('./utils/getDate')



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
let scheduledMessageDate
let podTimestampDates = {}
let discordServer = {}
let serverEmojis = {}



//------------------------------------------------//
//---------------COLLECT FUNCTION-----------------//
//------------------------------------------------//

  function collectEntryReactions (emojiName, podsMessage, podNumber) {
    podNumber = podNumber + 1;
    let usersIdTable = [];

    const filter = (reaction, user) => {
        return [emojiName].includes(reaction.emoji.name) && user.id != podsMessage.author.id;
    };
    
    const collector = podsMessage.createReactionCollector({ filter, max: maxPodsEntries, time: 950400000, dispose: true }); // "time" -> la collecte d'inscriptions s'arrête 11 jours plus tard
    
    collector.on('collect', (reaction, user) => {
        usersIdTable.push(
            {
                "username" : user.username,
                "userId" : user.id
            }
        );

        db.collection('pods-weeks-entries').doc(scheduledMessageDate.toString()).update(
            {
                [getRightValue.nameInDb(reaction.emoji.name)]: usersIdTable
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
                    getRightValue.checkinChannel(emojiName, podNumber, discordServer).send(`------------ \n\nLa **TABLE ${podNumber} ** de ***${getRightValue.dayInMessage(emojiName)} ${getRightValue.timestampInMessage(emojiName, podTimestampDates)} ${getRightValue.hourInMessage(emojiName)}*** a ses 8 joueurs ! \n- <@${usersIdTable[0].userId.toString()}> \n- <@${usersIdTable[1].userId.toString()}> \n- <@${usersIdTable[2].userId.toString()}> \n- <@${usersIdTable[3].userId.toString()}> \n- <@${usersIdTable[4].userId.toString()}> \n- <@${usersIdTable[5].userId.toString()}> \n- <@${usersIdTable[6].userId.toString()}> \n- <@${usersIdTable[7].userId.toString()}> \n\nValidez votre présence en cliquant sur la réaction ✅ en bas de ce message !`)
                    .then((sentMessage) => { 
                        sentMessage.react('✅')
                    });
                    console.log("✔️ Pod number " + podNumber + " is now full");
                    usersIdTable = [];
                    console.log("⚪️ Entries array for the Pod number " + podNumber + " successfully cleared : " +  usersIdTable);
                    return collectEntryReactions (emojiName, podsMessage, podNumber);
                }

                if (podNumber === 2) {
                    getRightValue.checkinChannel(emojiName, podNumber, discordServer).send(`------------ \n\nLa **TABLE ${podNumber} ** de ***${getRightValue.dayInMessage(emojiName)} ${getRightValue.timestampInMessage(emojiName, podTimestampDates)} ${getRightValue.hourInMessage(emojiName)}*** a ses 8 joueurs ! \n- <@${usersIdTable[0].userId.toString()}> \n- <@${usersIdTable[1].userId.toString()}> \n- <@${usersIdTable[2].userId.toString()}> \n- <@${usersIdTable[3].userId.toString()}> \n- <@${usersIdTable[4].userId.toString()}> \n- <@${usersIdTable[5].userId.toString()}> \n- <@${usersIdTable[6].userId.toString()}> \n- <@${usersIdTable[7].userId.toString()}> \n\nValidez votre présence en cliquant sur la réaction ✅ en bas de ce message !`)
                    .then((sentMessage) => { 
                        sentMessage.react('✅')
                    });
                    console.log("✔️ Pod number " + podNumber + " is now full");
                    usersIdTable = [];
                    console.log("⚪️ Entries array for the Pod number " + podNumber + " successfully cleared : " +  usersIdTable);
                    return collectEntryReactions (emojiName, podsMessage, podNumber);
                }

            }

            else {
                podsMessage.channel.send(`------------ \n\n**ALERT - POD DU ${getRightValue.dayInMessage(emojiName)} ${getRightValue.timestampInMessage(emojiName, podTimestampDates)} ${getRightValue.hourInMessage(emojiName)} :**\n\n 2 tables de pods ont déjà été gérées par votre serviteur dévoué Drafty. \n\nMalheureusement, pour cette **${podNumber}ème table maintenant complète**, vous allez devoir vous débrouiller comme des grands! Créez une catégorie TABLE POD-${podNumber} ainsi que les channels associés, puis postez un message de check-in un peu comme je le fais d'habitude !`)                    
                return collectEntryReactions (emojiName, podsMessage, podNumber);
            }

    });   
}



//------------------------------------------------//
//-------RE-START LAST ENTRIES COLLECTION---------//
//------------------------------------------------//

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


async function restartLastEntriesCollection () {
    await getLastWeekCollection()
    console.log(lastWeekCollection.data.scheduledMessageId)

    podTimestampDates = getDate.podsTimestamp(scheduledMessageDate)

    discordServer.channelEntries.messages.fetch(lastWeekCollection.data.scheduledMessageId)
        .then(message => {
            collectEntryReactions ('l_letter', message, podNumber);
            collectEntryReactions ('m_letter', message, podNumber); 
            collectEntryReactions ('w_letter', message, podNumber); 
            collectEntryReactions ('j_letter', message, podNumber); 
            collectEntryReactions ('v_letter', message, podNumber); 
            collectEntryReactions ('s_letter', message, podNumber);
            collectEntryReactions ('d_letter', message, podNumber);
            collectEntryReactions ('⏰', message, podNumber);
        })
}



//---------------------------------------//
//---------SCHEDULED MSG ENTRIES---------//
//---------------------------------------//

let scheduledPodsMessage = new cron.CronJob('00 * * * * *', () => { 
    // for Cron : each " * " above means one parameter, 
    // from left to right : second 0-59, minute 0-59, hour 0-23, day of month 1-31, month 0-11, day of week 0-6
    // You can use "*" to don't use the parameter
    // Here, the Cron job is done every minutes with the "00" in first position (better to test and debug)

    scheduledMessageDate = new Date();
    podTimestampDates = getDate.podsTimestamp(scheduledMessageDate)
    const scheduledMessageContent = `**- Ouverture des inscriptions pour la semaine du ${podTimestampDates.mondayShortFormat} au ${podTimestampDates.sundayShortFormat} -** \n\nPour vous inscrire réagissez à ce message avec vos jours de disponibilité : \n\n${serverEmojis.monday} : Lundi ${podTimestampDates.monday} (20h) - Draft ${currentMtgFormat} \n${serverEmojis.tuesday} : Mardi ${podTimestampDates.tuesday} (20h) - Draft ${currentMtgFormat} \n${serverEmojis.wednesday} : Mercredi ${podTimestampDates.wednesday} (20h) - Draft ${currentMtgFormat} \n${serverEmojis.thursday} : Jeudi ${podTimestampDates.thursday} (20h) - Draft ${currentMtgFormat} \n${serverEmojis.friday} : Vendredi ${podTimestampDates.friday} (20h30) - Draft ${currentMtgFormat} \n${serverEmojis.saturday} : Samedi ${podTimestampDates.saturday} + " (20h30) - Draft ${currentMtgFormat} \n${serverEmojis.sunday} : Dimanche ${podTimestampDates.sunday} (20h) - Draft ${currentMtgFormat} \n:alarm_clock:  : Dimanche ${podTimestampDates.sunday} : Draft Asynchrone (21h) - ${currentMtgFormat} \n\nDès lors qu'une table de 8 joueurs est complète, un message de check-in automatique sera posté dans le channel approprié. Vous serez alors tagués et invités à valider votre présence.\n\nLes joueurs inscrits supplémentaires (mais en nombre insuffisant pour constituer une POD) sont considérés comme prioritaires sur les remplacements éventuels (absence de check-in, désistement de dernière minute etc...).`

    discordServer.channelEntries.send(scheduledMessageContent)
    .then(async (sentMessage) => { 
        sentMessage.react(serverEmojis.monday)
        sentMessage.react(serverEmojis.tuesday)
        sentMessage.react(serverEmojis.wednesday)
        sentMessage.react(serverEmojis.thursday)
        sentMessage.react(serverEmojis.friday)
        sentMessage.react(serverEmojis.saturday)
        sentMessage.react(serverEmojis.sunday)
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

        collectEntryReactions ('l_letter', podsMessage, podNumber);
        collectEntryReactions ('m_letter', podsMessage, podNumber); 
        collectEntryReactions ('w_letter', podsMessage, podNumber);
        collectEntryReactions ('j_letter', podsMessage, podNumber);
        collectEntryReactions ('v_letter', podsMessage, podNumber); 
        collectEntryReactions ('s_letter', podsMessage, podNumber);
        collectEntryReactions ('d_letter', podsMessage, podNumber);
        collectEntryReactions ('⏰', podsMessage, podNumber);

        console.log('🆗 Scheduling cron message just worked')

    })

});



//-----------------------------//
//-------COMMANDS ENGINE-------//
//-----------------------------//

// client.on('message', ...); // When we'll want to set up some chat commands



//-----------------------------//
//--------CLIENT LOGIN---------//
//-----------------------------//

client.once('ready', async () => {
    console.log('IM SUPER READY YEA!')

    // Serveur JK

    discordServer = 
    {
        channelEntries : client.channels.cache.get("910686979828633611"), // Change the channel ID for your message here
        channelCheckIn1 : client.channels.cache.get("915042199270465626"), // Change the channel ID for pod 1 check-in here
        channelCheckIn2 : client.channels.cache.get("915674849370853386"), // Change the channel ID for pod 2 check-in here
        channelCheckInAsync : client.channels.cache.get("915674925690392587"), // Change the channel ID for asynchron pod check-in here
        guild : client.guilds.cache.get("910603170336624640") // Change your Discord server ID here 
    }

    serverEmojis = 
    {
         // Change here and below the emojis IDs considering your server's emojis
        monday : discordServer.guild.emojis.cache.get('911267403072167966'),
        tuesday : discordServer.guild.emojis.cache.get('911267403046998016'),
        wednesday : discordServer.guild.emojis.cache.get('911267403084730418'),
        thursday : discordServer.guild.emojis.cache.get('911267403046985738'),
        friday : discordServer.guild.emojis.cache.get('911268283901177876'),
        saturday : discordServer.guild.emojis.cache.get('911267403034415114'),
        sunday : discordServer.guild.emojis.cache.get('911267403109912606'),
    }

    restartLastEntriesCollection()
    scheduledPodsMessage.start()
})

client.login(process.env.DISCORD_TOKEN);