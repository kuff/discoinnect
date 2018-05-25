
/** 
 * various utility functions
 */
module.exports = {

    /**
     * wether or not a message correctly mentions a user
     * @param { String } parameter the part of the message that sould contain a mention
     * @param { Message } message the Message object containing the mention
     * @returns { boolean } 
     */
    hasMention(parameter, message) {
        const mentions = message.mentions.members
        return parameter && mentions && mentions.first()
            && mentions.first().toString() === parameter;
    }

}