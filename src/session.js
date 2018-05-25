
/**
 * the class managing members and payouts withing a session
 */
module.exports = class Session {

    constructor(rate, members) {
        this.rate = rate
        this.members = members;
        this.channelID = members[0].voiceChannelID;
        this.stamp = Date.now();
    }

    /**
     * retirives the potential payout
     * @returns { Number } the payout
     */
    payout() {
        const elapsed = Date.now() - this.stamp;
        return this.rate * (elapsed / 1000 / 60);
    }

    /**
     * compares this session to another session
     * @param { Session } session the session to compare with
     * @returns { boolean } wether or not the sessions are identical
     */
    equals(session) {           // not used
        const set = new Set();
        const members = this.members.concat(session.members);
        members.forEach(elem => set.add(elem.id));
        return set.size == this.members.length 
            && this.rate == session.rate;
    }

}