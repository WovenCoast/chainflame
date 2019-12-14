const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: [],
            description: language => language.get('COMMAND_SKIP_DESCRIPTION'),
            usage: '[amount:number]'
        });
        this.normalUserLimit = 5;
    }

    async run(msg, [amount]) {
        let serverQueue = this.client.queue.get(msg.guild.id);
        if (!serverQueue) return msg.sendLocale('NO_QUEUE');
        if (!amount) amount = 1;
        if (!msg.guild.settings.isPremium && amount > this.normalUserLimit) return msg.channel.send(`:x: This guild needs Tropic Premium to skip more than ${this.normalUserLimit} songs!`)
        if (amount > serverQueue.songs.length) amount = amount % serverQueue.songs.length;
        this.skip(msg, serverQueue, amount);
    }

    skip(msg, serverQueue, amount) {
        const skippedSongs = [];
        if (serverQueue.playing === false) serverQueue.playing = true;
        if (amount > 0) {
            if (serverQueue.loop === "loopone") {
                serverQueue.loop = "loopall";
                for (let i = amount; i > 0; i--) {
                    skippedSongs.push(serverQueue.songs[i]);
                    serverQueue.player.stop();
                }
                serverQueue.loop = "loopone";
            } else {
                for (let i = amount; i > 0; i--) {
                    skippedSongs.push(serverQueue.songs[i]);
                    serverQueue.player.stop();
                }
            }
            return skippedSongs.length == 1 ? msg.channel.send(`:white_check_mark: Skipped the song **${skippedSongs[0].info.title}** requested by *${skippedSongs[0].requestedBy.tag}*`) : msg.channel.send(`:white_check_mark: Skipped ${amount} songs:- ${skippedSongs.map(s => `**${s.info.title}** requested by *${s.requestedBy.tag}*`).join(', ')}`);
        } else {
            return msg.channel.send(`:octagonal_sign: You can't skip ${amount} songs!`);
        }
    }
};