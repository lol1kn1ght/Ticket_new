const { MessageEmbed } = require("discord.js");

module.exports = class Command_template {
  constructor(interaction) {
    this.interaction = interaction;
  }

  msg(embed_text) {
    let embed = new MessageEmbed()
      .setAuthor(
        this.interaction.member.user.tag,
        this.interaction.member.user.displayAvatarURL({ dynamic: true })
      )
      .setDescription(embed_text);

    return this.interaction.reply({ embeds: [embed] });
  }
};
