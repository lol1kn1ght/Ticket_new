const {Command_template} = require("../config/templates");
const Discord = require("discord.js");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);

    this.options = {
      permissions: [],
      channels: [],
      custom_perms: ["OWNER"],
      slash: {
        name: "shop-card",
        description: "Комадна для тестов [BOT_OWNER]"
      }
    };
  }

  async execute() {
    this.db = this.mongo.db("gtaEZ");

    this.msg("DSD");
    this.interaction.followUp("DSD");
    this.interaction.followUp("DSD");
  }
}

module.exports = Command;
