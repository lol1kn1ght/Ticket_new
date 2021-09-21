const Discord = require("discord.js");
const {Command_template} = require("../config/templates");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);

    this.options = {
      permissions: ["ADMINISTRATOR"],
      channels: ["707162375127826504"],
      custom_perms: [],
      slash: {
        name: "создать-панель",
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
            description: "айди канала для новой панели.",
            type: 7,
            required: true
          },
          {
            name: "следящий",
            description: "роль следящего для новой панели.",
            type: 8,
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
    if (!panel_name) this.msgFalseH("Вы не указали название панели.");

    let args_channel = this.command_args.filter(
      option => option.name === "канал"
    )[0]?.value;
    let panel_channel = this.interaction.guild.channels.cache.get(args_channel);
    if (!panel_channel)
      return this.msgFalseH("Вы указали несуществующий канал для панели!");

    let moderator_role = this.command_args.filter(
      option => option.name === "следящий"
    )[0]?.role;
    if (!moderator_role) return this.msgFalseH("Вы не указали роль следящего!");

    let panel_embed = new Discord.MessageEmbed()
      .setTitle(panel_name)
      .setDescription("Для создания нового тикета нажмите на кнопку ниже.")
      .setColor(this.config.colorEmbed);
    let row = new Discord.MessageActionRow();

    let buttons = [
      new Discord.MessageButton({
        type: "BUTTON",
        label: "Создать тикет",
        customId: "create_ticket",
        style: 2,
        disabled: false
      })
    ];

    row.addComponents(...buttons);

    let panels_db = this.db.collection("tickets_panels");
    let panels_data = await panels_db.find().toArray();

    let panel_id = this.f.random(0, 1000);

    while (panels_data.filter(panel => panel.panel_id === panel_id)[0]) {
      panel_id = this.f.random(0, 1000);
    }

    try {
      let panel_message = await panel_channel.send({
        embeds: [panel_embed],
        components: [row]
      });
      this.panel_message = panel_message;
    } catch (e) {
      return this.msgFalseH(
        `При отправки сообщения панели возникла ошибка!\nВозможно я не имею доступа к каналу ${panel_channel}!`
      );
    }
    let new_panel = {
      panel_name: panel_name,
      panel_channel: panel_channel.id,
      panel_message: this.panel_message.id,
      panel_id: panel_id,
      moderator_roles: [moderator_role.id]
    };

    panels_db.insertOne(new_panel);
    this.msgH("Вы успешно создали новую панель для тикетов!");
  }
}

module.exports = Command;
