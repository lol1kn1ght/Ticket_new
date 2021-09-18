const {Command_template} = require("../config/templates");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);

    this.options = {
      permissions: ["ADMINISTRATOR"],
      channels: ["742776483944071169"],
      custom_perms: [],
      slash: {
        name: "create-panel",
        description: "Создать панель. [ADMINISTRATOR]",
        options: [
          {
            name: "название",
            description: "название для новой панели.",
            type: 3,
            required: true
          },
          {
            name: "канал",
            description: "айди канала для панели.",
            type: 3,
            required: true
          }
        ]
      }
    };
  }

  async execute() {
    let panel_name = this.command_args.filter(
      option => option.name === "название"
    )[0]?.value;
    if (!panel_name) this.msgFalseH("Вы не указали название панели.");

    let args_channel = this.command_args.filter(
      option => option.name === "канал"
    )[0]?.value;
    let panel_channel = this.interaction.guild.channels.cache.get(args_channel);
    if (!panel_channel)
      return this.msgFalseH("Вы указали несуществующий канал для панели!");
  }
}

module.exports = Command;
