const {Command_template} = require("../config/templates");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);

    this.options = {
      permissions: ["ADMINISTRATOR"],
      custom_perms: [],
      slash: {
        name: "панели",
        description: "выводит список всех панелей"
      }
    };
  }

  async execute() {
    this.db = this.mongo.db("gtaEZ");
  }
}

module.exports = Command;
