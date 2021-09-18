const {Command_template} = require("../config/templates");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);

    this.options = {
      permissions: ["ADMINISTRATOR"],
      custom_perms: ["OWNER"],
      slash: {
        name: "test",
        description: "Комадна для тестов [BOT_OWNER]"
      }
    };
  }

  async execute() {
    this.msg("test");
  }
}

module.exports = Command;
