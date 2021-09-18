const { Command_template } = require("../config/templates");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);
  }

  async execute() {
    this.msg("test");
  }
}

module.exports = Command;
