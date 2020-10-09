# discoinnect
Enable earning and transfer of _Discoins_ between members of your Discord server. See also the [Discordify music bot](https://github.com/kuff/discordify).

## How it Works
The bot works by monitoring changes in server member states, awarding Discoins to users who are in the same voice channel, with a boost for each user above two, disregarding bot users. An additional bonus is also awarded for users who are playing the same game, while also in the same voice channel.

The algorithm for awarding coins emulates that of cryptocurrencies like Bitcoin by exponentially increasing the time it takes to earn new coins as more coins are mined. See the **Setup** section for how to customize this.

## Available Commands
Following is a list of commands available through the discoinnect bot:
+ `source` responds with a link to the [source code on GitHub](https://github.com/kuff/discoinnect).
+ `balance` responds with an overview of the issuing user's total Discoin balance.
+ `mine` responds with statistics on the total amount of Discoins mined as well as individually for the issuing user.
+ `transfer <amount> @<member>` enables transfer of Discoins from the issuing user to the mentioned user.

_There is currently no way of spending coins, beyond transfering them to other server members._

## Installation
You are of course free to use this software however you like (almost), as per the MIT license. Following is a short tutorial on how to spin up your own instance of the bot.
however, in order to run, the bot requires some credentials - more specifically a **Discord bot token** as well as the **id** of the bot user.

1.  A **Discord bot token** is optained by creating a new app on the [Discord app dashboard](https://discordapp.com/developers/applications) and then registering the app as a Bot User.
2.  The **id** of the bot user can then also be copy-pasted from the Discord app dashboard.

Hold on to this information, as it will become relevant in a minute. Now, for the actual installation process. This will be detailed using the command line on an *Ubuntu 16.04* machine, even though the code should be able to run in any environment that supports [NodeJS](https://nodejs.org/en/). Along with *NodeJS*, this guide also assumes that you have [Git](https://git-scm.com/), [NPM](https://www.npmjs.com/), and [node-gyp](https://github.com/nodejs/node-gyp) installed.

1.  Start by navigating to a suitable place for the bot source files to be installed.
2.  Next download the bot source files with `git clone https://github.com/kuff/discoinnect.git` and enter the directory by typing in `cd discoinnect`.
3.  Next up, install the bot dependencies with `npm i`.
4.  Now those credentials from earlier come into play. Start by creating a config.json file with `touch config.json` and open it in your favorite text editor.
5.  Then copy-paste the information gathered earlier, structured the following way:

```
{
    "token": "discord_bot_token_goes_here",
    "self_id": "discord_bot_id_goes_here",
}
```
7.  After typing in your information and saving the file you should be all set.
8.  Now, invite the bot to you Discord server by visiting the following link, substituting "BOT_ID_GOES_HERE" with your own bot id: https://discordapp.com/oauth2/authorize?&client_id=BOT_ID_GOES_HERE&scope=bot&permissions=0. Note that the bot must be able to see all voice channels in the server to properly award coins.
9.  Finally, spin up the bot with `npm start`. However, for long term program execution you should look into [PM2](http://pm2.keymetrics.io/) or a similar tool.

## Setup

Under the main directory there's a **settings.json** file where you can tweak a few things to your liking:
```
{
    "prefix": ".",
    "db_path": "db.json",
    "coin_cap": 1000,
    "base_rate": 0.02,
    "rate_modifier": 0.8,
    "game_modifier": 0.4
}
````
1.  The **prefix** is the special character(s) that the bot should react on, meaning the one you put in front of a command keyword when you want the bot to do something, e.g. `.rate`or `.transfer 100 @ServerMember`. As a result, I recommend that this be a special character, ensuring the bot is not invoked by mistake!
2.  The **db_path** specifies the location of the database file in JSON format. If this file does not exist on startup, it will automatically be created.
3.  The **coin_cap** specifies the maximum amount of Discoins that can be earned. The payout of coins becomes exponentially worse as more coins are mined, meaning this number will never be reached, as time taken to earn a new coin tends towards infinity.
4.  The **base_rate** is the base rate at which members earn Discoins. Without altering any of the above shown settings, it should take about a month to earn 950 Discoins, depending on member activity.
5.  The **rate_modifier** is the amount of bonus coins users earn for each server member in their voice channel. This is a multiple, meaning the more people in the same voice channel, the higher the payout.
6.  The **game_modifer** is the amount of bonus coins users earn when in the same voice channel _and_ playing the same game. This is also a multiple, meaning the more people playing the same game in the same voice channel, the higher the payout.
