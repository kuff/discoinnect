const { token, source_url } = require('../config.json');
const { prefix, coin_cap } = require('../settings.json');
const { hasMention } = require('./util.js');
const calcRate = require('./calc-rate.js');
const DatabaseHandler = require('./db.js');
const SessionsArray = require('./sessions-array.js');
const Discord = require('discord.js');

const client = new Discord.Client();
const db = new DatabaseHandler();
const sessions = new SessionsArray(db);

client.on('ready', () => {
    // bot successfully connected to Discord
    console.log(`${client.user.username}#${client.user
        .discriminator} is up and running!`);
})

client.on('message', message => {
    // on every message recieved by the Discord client
    if (!message.content.startsWith(prefix)
    || message.channel.type !== 'text') return;

    // filter out commands and parameters
    let params = message.content.trim().split(/ +/g);
    const command = params.shift().toLowerCase()
        .slice(prefix.length);
    params = params.filter(elem => elem != undefined);

    console.log('command:', command);
    console.log('params:', params);
    
    switch(command) {

        case 'source':
            // send a link to the GitHub repo with the source code
            message.reply('link to the source code on GitHub: '
                + source_url);
            break;

        case 'rate':
            // ignore bots
            if (message.author.bot) return;
            // assume the user wants to reference themselves
            member = message.member;
            msg = 'you are ';
            if (hasMention(params[0], message)) {
                // if not, reference the mentioned user
                member = message.mentions.members.first();
                msg = `${member.user.username} is `
            }
            // calculate the users rate and display it
            const rate = sessions.getRate(member);
            message.reply(msg + 'currently earning `' + rate +
                ' Discoin(s)` per minute!');
            break;
        
        case 'balance':
            // ignore bots
            if (message.author.bot) return;
            // assume the user wants to reference themselves
            member = message.member;
            msg = 'you currently have';
            if (hasMention(params[0], message)) {
                // if not, reference the mentioned user
                member = message.mentions.members.first();
                msg = `${member.user.username} currently has`
            }
            // calculate the total balance and display it
            const balance = db.getMember(member).balance;
            const payout = sessions.getPayout(member);
            const amount = balance + payout;
            message.reply(msg + ' `' + amount 
                + ' Discoin(s)` in the bank!');
            break;

        case 'mine':
            // calculate the total amount of coins in circulation
            const mined = db.balance() + sessions.payout();
            // calculate the percentage of coins mined
            mined_percent = Math.round(mined / coin_cap * 10000)
                / 100;
            // write out the beginning of the message, since the
            // rest depends on wether or not the user has 
            // participated in mining before
            msg = '`' + mined_percent + '% of all '
                + 'Discoins` have been mined, ';
            // calculate the users Discoin earnings from mining
            const contribution = db.getMember(message.member)
                .earnings.mining;
            if (!message.author.bot && contribution > 0) {
                // if the user has in fact earned coins from mining,
                // calculate the percentage of all mined coins 
                // contributed by that user and add it to the message
                const contribution_percent = Math
                    .round((contribution / mined) * 100);
                msg += 'of which `' + contribution_percent 
                    + '%` have been mined by you!';
            }
            // otherwise, tell the user how effective mining 
            // currently is based on the amount of coins mined
            else msg += 'resulting in a `' + mined_percent 
                + '%` reduction in mining yeild!';
            // finally, send the message
            message.reply(msg);
            break;

        case 'transfer':
            if (message.author.bot) return;
            // catch various errors in the command format
            let response = 'incorrectly formatted command! '
            if (params[1] === 'to' && !Number.isNaN(params[0])
            && parseFloat(params[0]) > 0 && message.mentions.members
            && params[2]) {
                // payout any active sessions to insure balance
                // consistency
                sessions.update(message.member);
                // execute transfer and help out the user if it 
                // doesn't go through
                const recipient = message.mentions.members.first();
                response = db.transfer(message.member, recipient,
                    parseFloat(params[0]), message);
                if (!response) return;
            }
            // hint at correnct command formatting if transition
            // fails
            message.reply(response 
                + 'Try using the command like this: `' + prefix 
                + 'transfer <amount> to <recipient>`');
            break;

        // other cases...
        
    }
});

client.on('voiceStateUpdate', (old_member, new_member) => {
    // when users connect or disconnect to voice channels
    console.log('voiceStateUpdate! Causing the following');
    // update the sessions
    sessions.update(new_member);
});

client.on('presenceUpdate', (old_member, new_member) => {
    if (!sessions.getSession(new_member)) return;
    // when a users presence changes, looking particularly for games
    // played by users who are already in sessions (aka mining)
    console.log('presenceUpdate! Causing the following');
    // update the sessions
    sessions.update(new_member);
});

// sign the bot into Discord
client.login(token);