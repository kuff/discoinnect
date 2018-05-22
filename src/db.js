const { db_path } = require('../settings.json');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

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

    getMember(member) {
        const data = this.db.get(`members[${member.user.id}]`, 
            undefined).value();
        return data ? data : { balance: 0, earnings: {
            mining: 0, gambling: 0, recieved: 0
        } };
    }

    set(id, data) {
        if (data.balance > 0 && !data.epoch) data.epoch = Date.now();
        return this.db.set(`members[${id}]`, data).value();
    }

    write() {
        return this.db.write();
    }

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

    transfer(from, to, amount, message) {
        if (!to || !to.user)
            return 'cannot send coins to that user! ';
        if (to.user.bot) {
            message.reply('you cannot send coins to bots!');
            return;
        }
        if (from === to) 
            return 'you cannot send coins to yourself! '
        let sender = this.getMember(from);
        let recipient = this.getMember(to);
        const balance = sender.balance
        const new_balance = balance - amount;
        if (new_balance < 0) {
            message.reply('insufficient funds! You only ' 
            + 'have `' + balance + ' Discoin(s)` in the bank!');
            return;
        }
        sender.balance = new_balance;
        recipient.balance += amount;
        this.set(from.user.id, sender);
        this.set(to.user.id, recipient);
        this.write();
        message.reply('successfully transfered `' + amount 
            + ' Discoin(s)` to ' + to + '!');
    }

    spend(amount, member, message) {
        // ...
    }

}