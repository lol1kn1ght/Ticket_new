const {MessageEmbed} = require("discord.js");

module.exports = class Command_template {
  constructor(interaction) {
    this.interaction = interaction;
  }

  msg(embed_text, options) {
    let embedTrue = new MessageEmbed()
      .setAuthor(
        this.interaction.member.user.tag,
        this.interaction.member.user.displayAvatarURL({dynamic: true})
      )
      .setDescription(embed_text)
      .setColor(this.config.colorEmbed)
      .setTimestamp();

    return this._send(embedTrue, options);
  }

  msgFalse(embed_text, options) {
    let embedFalse = new MessageEmbed()
      .setAuthor(
        this.interaction.member.user.tag,
        this.interaction.member.user.displayAvatarURL({dynamic: true})
      )
      .setDescription(embed_text)
      .setColor(this.config.colorEmbedFalse)
      .setTimestamp();

    return this._send(embedFalse, options);
  }

  _send(embed, options) {
    try {
      this.interaction.reply(Object.assign({embeds: [embed]}, options));
    } catch (e) {
      this.interaction.reply({embeds: [embed]});
    }
  }
};
