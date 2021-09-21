const {MessageEmbed} = require("discord.js");

module.exports = class Command_template {
  constructor(interaction) {
    this.interaction = interaction;
  }

  msg(embed_text, options) {
    let embedTrue = this._true_embed(embed_text);

    return this._send(embedTrue, options);
  }

  msgH(embed_text, options = {}) {
    options.ephemeral = true;
    return this.msg(embed_text, options);
  }

  msgE(embed_text, options = {}) {
    if (this.interaction.ephemeral || !this.interaction.replied) {
      this.msg(embed_text, options);
      console.log("1");
      return;
    }

    let embedTrue = this._true_embed(embed_text, options);

    options.embeds = [embedTrue];
    try {
      return this.interaction.editReply(options);
    } catch (e) {
      return this.interaction.editReply({embeds: [embedTrue]});
    }
  }

  msgFalse(embed_text, options) {
    let embedFalse = this._false_embed(embed_text);

    return this._send(embedFalse, options);
  }

  msgFalseH(embed_text, options = {}) {
    options.ephemeral = true;
    return this.msgFalse(embed_text, options);
  }

  msgFalseE(embed_text, options = {}) {
    if (this.interaction.ephemeral || !this.interaction.replied)
      return this.msgFalse(embed_text, options);

    let embedTrue = this._false_embed(embed_text, options);

    try {
      return this.interaction.editReply(embedTrue, options);
    } catch (e) {
      return this.interaction.editReply(embedTrue);
    }
  }

  _true_embed(embed_text) {
    if (!embed_text) throw new Error("No embed text");

    let embedTrue = new MessageEmbed()
      .setAuthor(
        this.interaction.member.user.tag,
        this.interaction.member.user.displayAvatarURL({dynamic: true})
      )
      .setDescription(embed_text)
      .setColor(this.config.colorEmbed)
      .setTimestamp();

    return embedTrue;
  }

  _false_embed(embed_text) {
    if (!embed_text) throw new Error("No embed text");

    let embedFalse = new MessageEmbed()
      .setAuthor(
        this.interaction.member.user.tag,
        this.interaction.member.user.displayAvatarURL({dynamic: true})
      )
      .setDescription(embed_text)
      .setColor(this.config.colorEmbedFalse)
      .setTimestamp();

    return embedFalse;
  }
  _send(embed, options) {
    try {
      if (!this.interaction.replied) {
        return this.interaction.reply(
          Object.assign({embeds: [embed]}, options)
        );
      }
      if (this.interaction.replied) {
        return this.interaction.followUp(
          Object.assign({embeds: [embed]}, options)
        );
      }
    } catch (e) {
      if (!this.interaction.replied) {
        return this.interaction.reply(Object.assign({embeds: [embed]}));
      }
      if (this.interaction.replied) {
        return this.interaction.followUp(Object.assign({embeds: [embed]}));
      }
    }
  }
};
