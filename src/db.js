const { db_path } = require('../settings.json');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

/**
 * the class responsible for handling the database
 */
module.exports = class Database {

    constructor(path = db_path) {
        this.adapter = new FileSync(path);
        this.db = low(this.adapter);
        this.db.defaults({ members: [] });
        this.balance = () => this.db.get('members', [{ balance: 0 }])
            .map('balance')
            .sum()
            .value();
    }

    /**
     * retrieves a specific member object from the database
     * @param { Member || id (String) } member the member to look for, either a Member object or an id string
     * @returns { Object } return the found member object, or the polyfill otherwise
     */
    getMember(member) {
        let id = member
        if (member.user) id = member.user.id;
        const data = this.db.get(`members[${id}]`, 
            undefined).value();
        return data ? data : { balance: 0, earnings: {
            mining: 0, gambling: 0, recieved: 0
        } };
    }

    /**
     * retirieves all database members in a map
     * @returns { Map<Object> } a map of all members in the database
     */
    getAllMembers() {
        let map = new Map()
        this.db.get('members').keys().forEach(id => 
            map.set(id, this.getMember(id))).value();
        return map;
    }

    /**
     * sets the values of a specific member object
     * @param { String } id the id string of the member to write to
     * @param { Object } data the data to be written
     */
    set(id, data) {
        if (data.balance > 0 && !data.epoch) data.epoch = Date.now();
        return this.db.set(`members[${id}]`, data).value();
    }

    /**
     * writes to the db, since "set" doesn't
     */
    write() {
        return this.db.write();
    }

    /**
     * pays out given sessions
     * @param { Session || Array<Session> } sessions the session(s) to pay out
     */
    payout(sessions) {
        if (!Array.isArray(sessions)) sessions = Array.of(sessions);
        sessions.forEach(session => {
            const payout = session.payout();
            session.members.forEach(member => {
                let data = this.getMember(member)
                data.balance += payout;
                data.earnings.mining += payout;
                this.set(member.user.id, data);
            });
        });
        this.write();
    }

    /**
     * transfers a sum from one member to another
     * @param { Member } from the member to treat as sender
     * @param { Member } to the member to treat as recipient
     * @param { Number } amount the amount to be transfered
     * @param { Message } message the initiating message
     * @returns { String || void } retrieves error string, or void if successful
     */
    transfer(from, to, amount, message) {
        // if no recipient is given, return error message
        if (!to || !to.user)
            return 'cannot send coins to that user! ';
        // if the recipient is a bot, send the error and terminate
        if (to.user.bot) {
            message.reply('you cannot send coins to bots!');
            return;
        }
        // if sender and recipient is the same user, return error
        // message
        if (from === to) 
            return 'you cannot send coins to yourself! '
        // retrive sender and recipient balances
        let sender = this.getMember(from);
        let recipient = this.getMember(to);
        const balance = sender.balance
        const new_balance = balance - amount;
        if (new_balance < 0) {
            // if the senders balance becomes less than 0 after the 
            // the transfer, explain the error and terminate
            message.reply('insufficient funds! You only ' 
            + 'have `' + balance + ' Discoin(s)` in the bank!');
            return;
        }
        // update balances and commit the changes to the database
        sender.balance = new_balance;
        recipient.balance += amount;
        this.set(from.user.id, sender);
        this.set(to.user.id, recipient);
        this.write();
        // notify the user of the successful transfer
        message.reply('successfully transfered `' + amount 
            + ' Discoin(s)` to ' + to + '!');
    }

    spend(amount, member, message) {
        // not yet implemented...
    }

}