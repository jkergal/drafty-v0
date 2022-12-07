interface Date {
	addDays(days: number): Date;
	getWeek(downOffSet: number): number;
}

class GetDate {
	// To put updated Timestamps in Discord messages

	timestampSeconds(date: Date, dayOfWeek: number) {
		Date.prototype.addDays = function (days) {
			const date = new Date(this.valueOf());
			date.setDate(date.getDate() + days);
			return date;
		};

		Date.prototype.getWeek = function (downOffSet: number) {
			// downOffSet : 1-7 (Monday - Sunday), if in your country weeks begin with Monday, choose 1

			downOffSet = typeof downOffSet == 'number' ? downOffSet : 0; //default downOffSet to zero
			var newYear = new Date(this.getFullYear(), 0, 1);
			var day = newYear.getDay() - downOffSet; //the day of week the year begins on
			day = day >= 0 ? day : day + 7;
			var daynum =
				Math.floor(
					(this.getTime() -
						newYear.getTime() -
						(this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) /
						86400000
				) + 1;
			var weeknum;
			//if the year starts before the middle of a week
			if (day < 4) {
				weeknum = Math.floor((daynum + day - 1) / 7) + 1;
				if (weeknum > 52) {
					const nYear = new Date(this.getFullYear() + 1, 0, 1);
					let nday = nYear.getDay() - downOffSet;
					nday = nday >= 0 ? nday : nday + 7;
					/*if the next year starts before the middle of
                      the week, it is week #1 of that year*/
					weeknum = nday < 4 ? 1 : 53;
				}
			} else {
				weeknum = Math.floor((daynum + day - 1) / 7);
			}
			return weeknum;
		};

		function getNextDayOfWeek(date: Date, dayOfWeek: number) {
			let resultDate = new Date(date.getTime());

			resultDate.setDate(date.getDate() + ((7 + dayOfWeek - date.getDay()) % 7));

			if (
				(date.getDate() === resultDate.getDate() &&
					date.getDay() === resultDate.getDay()) ||
				date.getWeek(1) === resultDate.getWeek(1)
			) {
				resultDate = resultDate.addDays(7);
				return resultDate;
			} else {
				return resultDate;
			}
		}

		let ms = getNextDayOfWeek(date, dayOfWeek).getTime();

		let sec = Math.floor(ms / 1000);
		return sec;
	}

	discordFormat(date: Date, dayOfWeek: number) {
		const timestampSeconds = this.timestampSeconds(date, dayOfWeek);
		return '<t:' + timestampSeconds + ':D>';
	}

	discordShortFormat(date: Date, dayOfWeek: number) {
		const timestampSeconds = this.timestampSeconds(date, dayOfWeek);
		return '<t:' + timestampSeconds + ':d>';
	}

	podsTimestamp(date: Date) {
		return {
			monday: this.discordFormat(date, 1),
			mondayShortFormat: this.discordShortFormat(date, 1),
			tuesday: this.discordFormat(date, 2),
			wednesday: this.discordFormat(date, 3),
			thursday: this.discordFormat(date, 4),
			friday: this.discordFormat(date, 5),
			saturday: this.discordFormat(date, 6),
			sunday: this.discordFormat(date, 7),
			sundayShortFormat: this.discordShortFormat(date, 7)
		};
	}
}

module.exports = new GetDate();
