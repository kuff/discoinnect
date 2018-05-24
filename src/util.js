

module.exports = {

    hasMention(parameter, message) {
        const mentions = message.mentions.members
        return parameter && mentions && mentions.first()
            && mentions.first().toString() === parameter;
    }

}