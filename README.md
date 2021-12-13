
# Drafty
A Discord bot that automatically organizes draft tournaments on Magic The Gathering Discord servers.

## Warning 
This bot is made for a specific Discord server. The french community of Magic The Gathering (Arena) players built several severs to improce the competitive pratice. One of them is about the limited format called "Draft".
You can obviously fork the code to inspire you, but it may not fit to your server.

## Description
Drafty does several things :
- it posts a scheduled message with the cron library, and puts reactions on it : this is a message proposing to members draft tournaments dates for the next week. 1 tournament per day of the week, so 1 reaction for each day.
- it collects all reaction from members on each emoji, and records all the entries in arrays
- when 8 users registered to one date, a "table" is complete : Drafty posts a check-in message in a specific channel
- then, the array for this day is cleared and regitrations are now open for a second table

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DISCORD_TOKEN`

`PREFIX`


## Installation

To run this project, you'll need to install with npm :

```discord.js
  npm install discord.js
```
```cron
  npm install cron
```   
```dotenv
  npm install dotenv
```  
## Authors

- [@jkergal](https://github.com/jkergal) (hello@johannkergal.fr)


## 🔗 Links
[![website](https://img.shields.io/badge/my_website-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://johannkergal.fr/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/johannkergal)
[![twitter](https://img.shields.io/badge/twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/zetyd)

