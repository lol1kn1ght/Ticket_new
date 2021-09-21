const { Command_template } = require("../config/templates");
const Discord = require("discord.js");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);

    this.options = {
      permissions: [],
      custom_perms: [],
      slash: {
        name: "COMMAND_NAME",
        description: "COMMAND_DESCRIPTION",
      }
    };
  }

  async execute() {
  this.db = this.mongo.db("gtaEZ");

  }
}

module.exports = Command;
