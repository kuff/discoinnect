const { base_rate, 
        rate_multiplier, 
        game_multiplier,
        coin_cap } = require('../settings.json');

module.exports = (mined, in_voice, in_game) => {
    // calculate the procentage of remaining mineable coins
    const mineable = 1 - (mined / coin_cap);
    // calculate rate based on members in voice channel
    let rate = base_rate + base_rate * (in_voice - 2) * 
        rate_multiplier;
    // then add the game modifier if applicable
    rate += !in_game 
        ? 0
        : rate * game_multiplier;
    // finally, round to nearest 1/10^3 decimal places
    return Math.round(rate * 1000 * mineable) / 1000;
}