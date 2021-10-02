const {Command_template} = require("../config/templates");
const Discord = require("discord.js");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);

    this.options = {
      permissions: [],
      custom_perms: [],
      slash: {
        name: "panel-info",
        description: "посмотреть информацию о нужной панели",
        options: [
          {
            name: "название",
            description: "название панели.",
            type: 3,
            required: true
          }
        ]
      }
    };
  }

  async execute() {
    this.db = this.mongo.db("gtaEZ");

    let panel_name = this.command_args.filter(
      option => option.name === "название"
    )[0]?.value;

    if (!panel_name)
      return this.msgFalseH(
        "Вы не указали название панели для просмотра информации."
      );

    let panels_db = this.db.collection("tickets_panels");
    let panels_data = await panels_db.find().toArray();

    let panel = panels_data.filter(
      panel => panel.panel_name.toLowerCase() === panel_name.toLowerCase()
    )[0];
    if (!panel) return this.msgFalseH("Вы указали несуществующую панель.");

    let panel_info = new Discord.MessageEmbed()
      .setTitle("Информация о панели:")
      .setThumbnail(this.interaction.guild.iconURL({dynamic: true}))
      .setColor(this.config.colorEmbed)
      .addField("Название:", panel.panel_name, true)
      .addField(
        "Панель:",
        `[Тык](https://discord.com/channels/${this.interaction.guild.id}/${panel.panel_channel}/${panel.panel_message})`,
        true
      )
      .addField("Активные тикеты:", `${panel.actieve_tickets?.length || 0}`)
      .addField(
        "Следящие роли:",
        panel.moderator_roles.map(role => `<@&${role}>`).join(", ")
      );
    this.interaction.reply({ephemeral: true, embeds: [panel_info]});
  }
}

module.exports = Command;
