class GetRightValue {

    nameInDb = (reactEmojiName) => {
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
    
    checkinChannel = (reactEmojiName, podNumber, discordServerObj) => {
        let channel
    
        switch(reactEmojiName) {
            case 'l_letter' : 
                (podNumber === 1 
                    ? channel = discordServerObj.channelCheckIn1 
                    : channel = discordServerObj.channelCheckIn2)
                break     
            case 'm_letter' :             
                (podNumber === 1 
                    ? channel = discordServerObj.channelCheckIn1 
                    : channel = discordServerObj.channelCheckIn2)
                break 
            case 'w_letter' : 
                (podNumber === 1 
                    ? channel = discordServerObj.channelCheckIn1 
                    : channel = discordServerObj.channelCheckIn2)
                break 
            case 'j_letter' : 
                (podNumber === 1 
                    ? channel = discordServerObj.channelCheckIn1 
                    : channel = discordServerObj.channelCheckIn2)
                break 
            case 'v_letter' : 
                (podNumber === 1 
                    ? channel = discordServerObj.channelCheckIn1 
                    : channel = discordServerObj.channelCheckIn2)
                break 
            case 's_letter' : 
                (podNumber === 1 
                    ? channel = discordServerObj.channelCheckIn1 
                    : channel = discordServerObj.channelCheckIn2)
                break 
            case 'd_letter' : 
                (podNumber === 1 
                    ? channel = discordServerObj.channelCheckIn1 
                    : channel = discordServerObj.channelCheckIn2)
                break 
            case '⏰' : 
                channel = discordServerObj.channelCheckInAsync 
                break
        }
    
        return channel
    }
    
    
    dayInMessage = (reactEmojiName) => {
        let day
    
        switch(reactEmojiName) {
            case 'l_letter' : day = "LUNDI"
                break
            case 'm_letter' : day = "MARDI"
                break
            case 'w_letter' : day = "MERCREDI"
                break
            case 'j_letter' : day = "JEUDI"
                break
            case 'v_letter' : day = "VENDREDI"
                break
            case 's_letter' : day = "SAMEDI"
                break
            case 'd_letter' : day = "DIMANCHE"
                break
            case '⏰' : day = "DRAFT ASYNCHRONE DE DIMANCHE"
                break
        }
    
        return day
    }
    
    hourInMessage = (reactEmojiName) => {
        let hour
    
        switch(reactEmojiName) {
            case 'l_letter' : hour = "20h"
                break
            case 'm_letter' : hour = "20h"
                break
            case 'w_letter' : hour = "20h"
                break
            case 'j_letter' : hour = "20h"
                break
            case 'v_letter' : hour = "20h30"
                break
            case 's_letter' : hour = "20h30"
                break
            case 'd_letter' : hour = "20h"
                break
            case '⏰' : hour = "21h"
                break
        }
    
        return hour
    }
    
    timestampInMessage = (reactEmojiName, podTimestampDatesObj) => {
        let timestamp
    
        switch(reactEmojiName) {
            case 'l_letter' : timestamp = podTimestampDatesObj.monday
                break
            case 'm_letter' : timestamp = podTimestampDatesObj.tuesday
                break
            case 'w_letter' : timestamp = podTimestampDatesObj.wednesday
                break
            case 'j_letter' : timestamp = podTimestampDatesObj.thursday
                break
            case 'v_letter' : timestamp = podTimestampDatesObj.friday
                break
            case 's_letter' : timestamp = podTimestampDatesObj.saturday
                break
            case 'd_letter' : timestamp = podTimestampDatesObj.sunday
                break
            case '⏰' : timestamp = podTimestampDatesObj.sunday
                break
        }
    
        return timestamp
    }
}


const getRightValue = new GetRightValue()

module.exports = getRightValue;