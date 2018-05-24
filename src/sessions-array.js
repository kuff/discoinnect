const calcRate = require('./calc-rate.js');
const Session = require('./session.js');

module.exports = class SessionsArray {
    
    constructor(database, sessions) {
        this.db = database;
        if (!sessions || !Array.isArray(sessions)) //
            this.sessions = [];                    // not used
        else this.sessions = sessions;             //
    }

    getSession(member) {
        if (!member) return;
        return this.sessions.find(session =>
            session.members.find(elem => 
                elem.user.equals(member.user)));
    }

    getRate(member) {
        const session = this.getSession(member);
        return session ? session.rate : 0;
    }

    getPayout(member) {
        const session = this.getSession(member);
        return session ? session.payout() : 0;
    }

    payout() {
        return !this.sessions[0] ? 0
            : this.sessions.reduce((acc, session) => 
                acc + session.payout(), 0);
    }

    update(member) {
        if (member.user.bot) return;
        const channel = member.voiceChannel;
        let input = [];
        if (channel) {
            // retrieve all members in the voice channel of the
            // updated member, if it exists
            input = Array.from(channel.members.values());
        }
        // create a list of all members in sessions
        let members = this.sessions.reduce((array, session) =>
            array.concat(session.members), []);
        // and concat that list with the input list and remove 
        // duplicates and bots as well as muted or idle members
        members = members.concat(input);
        members = members.filter((elem, index, self) =>
            index === self.indexOf(elem) && elem.voiceChannelID &&
            !elem.mute && elem.presence.status === 'online'
            && !elem.user.bot);
        // sort members into their appropriate channels, creating
        // a map of all active channels
        let channels = new Map();
        members.forEach(member => {
            const channel = member.voiceChannelID;
            if (channels.has(channel)) return channels.set(channel,
                channels.get(channel).concat(member));
            channels.set(channel, Array.of(member));
        });
        // arrange members of each channel in appropriate sessions
        let sessions = [];
        channels.forEach(channel => {
            if (channel.length < 2) return;
            // find any members playing games, creating a map of all
            // games being played
            let gamers = new Map();
            channel.forEach(member => {
                const game = member.presence.game;
                if (game) return gamers.has(game.name) 
                    ? gamers.set(game.name,
                      gamers.get(game.name).concat(member))
                    : gamers.set(game.name, Array.of(member));
            });
            // people playing games together should be handled
            // seperately from those who are just talking
            let playing = [];
            gamers.forEach(game => {
                if (game.length > 1) {
                    const rate = calcRate(this.db.balance(), 
                        channel.length, game.length);
                    sessions.push(new Session(rate, game));
                    playing = playing.concat(game);
                }
            });
            // handling people who are not playing togehter
            const just_talking = channel.filter(member => playing
                .indexOf(member) == -1);
            if (just_talking.length > 0) {
                const rate = calcRate(this.db.balance(), 
                    channel.length);
                sessions.push(new Session(rate, just_talking));
            }
        });
        // new sessions are loged while the earnings from the old
        // sessions are payed out and new ones phased in
        console.log('sessions:', sessions);
        this.db.payout(this.sessions);
        this.sessions = sessions;
    }
}