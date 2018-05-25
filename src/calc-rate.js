const { base_rate, 
        rate_modifier, 
        game_modifier,
        coin_cap } = require('../settings.json');

/**
 * calculates the rates for a specific session
 * @param { Number } mined total number of coins mined
 * @param { Number } in_voice number of people in specific voice channel
 * @param { Number } in_game number of people playing the same game in specific voice channel
 * @returns { Number } the owed rate
 */
module.exports = (mined, in_voice, in_game) => {
    // calculate the procentage of remaining mineable coins
    const mineable = 1 - (mined / coin_cap);
    // calculate rate based on members in voice channel
    let rate = base_rate + base_rate * (in_voice - 2) * 
        rate_modifier;
    // then add the game modifier if applicable
    rate += !in_game 
        ? 0
        : base_rate * in_game * game_modifier;
    // finally, round to nearest 1/10^3 decimal places
    // and add the coin cap modifier
    return Math.round(rate * 1000 * mineable) / 1000;
}