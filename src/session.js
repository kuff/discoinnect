

module.exports = class Session {

    constructor(rate, members) {
        this.rate = rate
        this.members = members;
        this.channelID = members[0].voiceChannelID;
        this.stamp = Date.now();
    }

    payout() {
        const elapsed = Date.now() - this.stamp;
        return this.rate * (elapsed / 1000 / 60);
    }

    equals(session) {           // not used
        const set = new Set();
        const members = this.members.concat(session.members);
        members.forEach(elem => set.add(elem.id));
        return set.size == this.members.length 
            && this.rate == session.rate;
    }

}