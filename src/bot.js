const { token } = require('../config.json');
const { prefix, coin_cap } = require('../settings.json');
const calcRate = require('./calc-rate.js');
const DatabaseHandler = require('./db.js');
const SessionsArray = require('./sessions-array.js');
const Discord = require('discord.js');

const client = new Discord.Client();
const db = new DatabaseHandler();
const sessions = new SessionsArray(db);

client.on('ready', () => {
    console.log(`${client.user.username}#${client.user
        .discriminator} is up and running!`);
})

client.on('message', message => {
    if (!message.content.startsWith(prefix)
    || message.channel.type !== 'text') return;

    let params = message.content.trim().split(/ +/g);
    const command = params.shift().toLowerCase()
        .slice(prefix.length);
    params = params.filter(elem => elem != undefined);

    console.log('command:', command);
    console.log('params:', params);
    
    switch(command) {

        case 'rate':
            if (message.author.bot) return;
            const rate = sessions.getRate(message.member);
            message.reply('you are currently earning `' + rate +
                ' Discoin(s)` per minute!');
            break;
        
        case 'balance':
            if (message.author.bot) return;
            let member = message.member;
            const balance = db.getMember(member).balance;
            const payout = sessions.getPayout(member);
            const amount = balance + payout;
            message.reply('you currently have `' + amount 
                + ' Discoin(s)` in the bank!');
            break;

        case 'mine':
            const mined = db.balance() + sessions.payout();
            mined_percent = Math.round(mined / coin_cap * 10000)
                / 100;
            message.reply('`' + mined_percent + '% of all '
                + 'Discoin(s)` have been mined, resulting in a '
                + 'mining inefficiency of `÷' + mined_percent 
                + '%` compared to the beginnning!');
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
    console.log('voiceStateUpdate! Causing the following');
    sessions.update(new_member);
});

client.on('presenceUpdate', (old_member, new_member) => {
    console.log('presenceUpdate! Causing the following');
    sessions.update(new_member);
});

client.login(token);