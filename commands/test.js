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
        name: "test",
        description: "Комадна для тестов [BOT_OWNER]"
      }
    };
  }

  async execute() {
    this.db = this.mongo.db("gtaEZ");

    let user = new this.f.Profile(this.db, this.interaction.member);
  }
}

module.exports = Command;
