const {Command_template} = require("../config/templates");
const Discord = require("discord.js");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);

    this.options = {
      permissions: [],
      test: "Nzk3NDEzMTEwNDgyNzMxMDI5.X_mG1A.-rNaf05MUNNluy-vEPmICelkhiU",
      channels: [],
      custom_perms: ["OWNER"],
      slash: {
        name: "test",
        description: "Комадна для тестов [BOT_OWNER]"
      }
    };
  }

  async execute() {
    let label = "1";
    let methods_row = new Discord.MessageActionRow();

    let stop = false;
  }
}

module.exports = Command;
