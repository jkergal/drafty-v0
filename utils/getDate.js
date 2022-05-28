class GetDate {

// To put updated Timestamps in Discord messages

timestampSeconds(date, dayOfWeek) {

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


discordFormat(date, dayOfWeek) {
    const timestampSeconds = this.timestampSeconds(date, dayOfWeek)
    return "<t:" + timestampSeconds + ":D>";
}


discordShortFormat(date, dayOfWeek) {
    const timestampSeconds = this.timestampSeconds(date, dayOfWeek)
    return "<t:" + timestampSeconds + ":d>";
}

podsTimestamp(date) {
    return {
        monday : this.discordFormat(date, 1),
        mondayShortFormat : this.discordShortFormat(date, 1),
        tuesday : this.discordFormat(date, 2),
        wednesday : this.discordFormat(date, 3),
        thursday : this.discordFormat(date, 4),
        friday : this.discordFormat(date, 5),
        saturday : this.discordFormat(date, 6),
        sunday : this.discordFormat(date, 7),
        sundayShortFormat : this.discordShortFormat(date, 7)
    }
}

}


const getDate = new GetDate()

module.exports = getDate;