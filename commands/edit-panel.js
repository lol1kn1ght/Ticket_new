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
        name: "edit-panel",
        description: "отредактировать панель"
      }
    };
  }

  async execute() {
    this.db = this.mongo.db("gtaEZ");

    let panels_db = this.db.collection("tickets_panels");
    let panels_data = await panels_db.find().toArray();

    if (!panels_data[0]) return this.msgFalseH("Список панелей пуст.");

    let menu_panels = [];

    for (let panel of panels_data) {
      let menu_field = {
        label: panel.panel_name,
        description: `Айди панели: ${panel.panel_id}`,
        value: `edit_${panel.panel_id}`
      };

      menu_panels.push(menu_field);
    }

    let row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId(`edit-panel`)
        .setPlaceholder("Выберите панель из списка что бы отредактировать ее:")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(menu_panels)
    );

    let menu_message = await this.msg(
      "Выберите панель из списка ниже что бы отредактировать ее:",
      {
        fetchReply: true,
        components: [row]
      }
    );
    this.menu_message = menu_message;

    let awaitComponent = await this.create_collector();
    this.awaitComponent = awaitComponent;
    let select_panel = await awaitComponent();
    if (!select_panel.isSelectMenu()) return console.log("te");

    let value = select_panel.values[0]?.split("_");
    let method_select = value[0];
    let select_panel_id = Number(value[1]);

    if (method_select !== "edit") return;

    if (isNaN(select_panel_id) || !method_select)
      return this.msgFalse(
        "При редактировании панели произошла ошибка, обратитесь к администрации (1)"
      );

    let panel = panels_data.filter(
      panel => panel.panel_id === select_panel_id
    )[0];
    if (!panel)
      return this.msgFalse(
        "При редактировании панели произошла ошибка, обратитесь к администрации (2)"
      );
    this.panel = JSON.parse(JSON.stringify(panel));

    let methods_menu = [
      {
        label: "название",
        description: `Отредактировать название канала`,
        value: `${panel.panel_id}_name`
      },
      {
        label: "канал",
        description: `Отредактировать канал в котором будет панель`,
        value: `${panel.panel_id}_channel`
      },
      {
        label: "следящий",
        description: `Добавить или удалить следящего за панелью`,
        value: `${panel.panel_id}_moderator`
      },
      {
        label: "категория",
        description: `Поменять категорию тикетов`,
        value: `${panel.panel_id}_category`
      },
      {
        label: "описание",
        description: `Поменять описание панели`,
        value: `${panel.panel_id}_description`
      }
    ];

    let methods_row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId(`edit-panel`)
        .setPlaceholder("Выберите что вы хотите отредактировать:")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(methods_menu)
    );
    await select_panel.update({components: []});

    this.msgE(
      `Текущая панель: **${panel.panel_name}** [${panel.panel_id}].\n\nВыберите что отредактировать:`,
      {
        components: [methods_row]
      }
    );

    let select_method = await awaitComponent();

    if (!select_method.isSelectMenu()) return;

    let edit_values = select_method.values[0]?.split("_");

    let edit_panel_id = Number(edit_values[0]);
    let edit_method = edit_values[1];

    if (isNaN(edit_panel_id) || !edit_method)
      return this.msgFalse(
        "При редактировании панели произошла ошибка, обратитесь к администрации (3)"
      );

    await select_method.update({components: []}).catch(e => {});
    await this.interaction.editReply({components: []});
    this.edit_panel(edit_method, panel);
  }

  async create_collector() {
    if (!this.menu_message)
      return this.msgFalseE(
        "При редактировании панели произошла ошибка, обратитесь к администрации (0)"
      );

    if (!this.collector) {
      let collector = this.menu_message.createMessageComponentCollector(
        select =>
          select.message.id !== this.panel_message.id &&
          select.member.id !== this.interaction.member.id,
        {
          time: 180000
          // componentType: "SELECT_MENU"
        }
      );

      this.collector = collector;
    }

    return () => {
      return new Promise((resolve, reject) => {
        this.collector.once("collect", select => {
          resolve(select);
        });
      });
    };
  }

  async updatePanel(panel, channel) {
    let panel_embed = new Discord.MessageEmbed()
      .setTitle(panel.panel_name)
      .setDescription(
        panel.panel_description
          ? panel.panel_description
          : "Для создания нового тикета нажмите на кнопку ниже."
      )
      .setColor(this.config.colorEmbed);

    let old_channel = this.interaction.guild.channels.cache.get(
      this.panel.panel_channel
    );

    let old_message = await old_channel?.messages
      ?.fetch(this.panel.panel_message)
      .catch(e => {});

    if (channel) {
      if (old_message) {
        old_message.delete({timeout: 1000}).catch(async e => {});
      }

      var new_message = await channel.send({
        embeds: [panel_embed],
        components: [
          new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton({
              type: "BUTTON",
              label: "Создать тикет",
              customId: "create_ticket",
              style: 2,
              disabled: false
            })
          )
        ]
      });
    }

    if (!channel) {
      if (old_message) {
        channel = old_message.channel;
        await old_message.edit({embeds: [panel_embed]});
      }
      if (!old_message) {
        channel =
          this.interaction.guild.channels.cache.get(panel.panel_channel) ||
          this.interaction.channel;

        var new_message = await channel.send({
          embeds: [panel_embed],
          components: [
            new Discord.MessageActionRow().addComponents(
              new Discord.MessageButton({
                type: "BUTTON",
                label: "Создать тикет",
                customId: "create_ticket",
                style: 2,
                disabled: false
              })
            )
          ]
        });
      }
    }
    if (new_message) panel.panel_message = new_message.id;

    this.db.collection("tickets_panels").updateOne(
      {
        panel_id: panel.panel_id
      },
      {
        $set: panel
      }
    );
    return new_message;
  }

  async edit_panel(method, panel) {
    switch (method.toLowerCase()) {
      case "name":
        this.msgE("Укажите ниже новое название панели в сообщении ниже:");

        let name_msg = await this.awaitMessage();

        if (!name_msg.first())
          return this.msgFalseE("Вы не указали новое название.");

        name_msg.first().delete();

        let name = name_msg.first()?.content;
        if (name.length > 30)
          return this.msgFalseE(
            "Длина названия панели не должна быть выше 50-ти символов"
          );

        panel.panel_name = name;

        await this.updatePanel(panel);

        name_msg.delete({timeout: 1000});
        this.msgE(`Вы успешно сменили название панели на **${name}**`);
        break;

      case "channel":
        this.msgE(
          `${this.interaction.guild.channels.cache.get(
            panel.panel_channel
          )}Текущий канал: \nУкажите новый канал для панели в сообщении ниже:`
        );

        let channel_message = await this.awaitMessage();

        if (!channel_message.first())
          return this.msgFalseE("Вы не указали канал для панели.");

        channel_message.first().delete();
        let channel =
          channel_message.first()?.mentions.channels.first() ||
          this.interaction.guild.channels.cache.get(
            channel_message.first()?.content
          );

        if (!channel)
          return this.msgFalseE("Вы указали недействительный канал.");

        panel.panel_channel = channel.id;
        await this.updatePanel(panel, channel);
        channel_message.delete({timeout: 1000});
        this.msgE(`Вы успешно сменили канал панели на ${channel}`);
        break;
      case "moderator":
        let moderator_row = new Discord.MessageActionRow().addComponents(
          new Discord.MessageButton({
            type: "BUTTON",
            label: "Добавить роль",
            customId: "add_role",
            style: "SUCCESS",
            disabled: false
          }),
          new Discord.MessageButton({
            type: "BUTTON",
            label: "Удалить роль",
            customId: "delete_role",
            style: "DANGER",
            disabled: false
          })
        );

        console.log("test 1");

        let moderator_method = await this.msgE(
          "Выберите что хотите сделать с ролью-модератором (добавить / удалить):",
          {components: [moderator_row]}
        );
        let method_moderator = await this.awaitComponent(moderator_method);
        await method_moderator.update({components: []});
        console.log("test 2");

        if (!method_moderator)
          return this.msgFalseE("Вы не указали метод для роли следящего.");

        switch (method_moderator.customId) {
          case "add_role":
            this.msgE("Укажите новую роль:");

            let role_message = await this.awaitMessage();
            if (!role_message?.first())
              return this.msgFalseE("Вы не указали новую роль.");

            role_message.first().delete();

            let role =
              role_message.first().mentions.roles.first() ||
              this.interaction.guild.roles.cache.get(
                role_message.first().content
              );
            if (!role) return this.msgFalseE("Вы указали несуществующую роль.");
            if (panel.moderator_roles.includes(role.id))
              return this.msgFalseE("Эта роль уже является следящей.");

            panel.moderator_roles.push(role.id);
            this.db.collection("tickets_panels").updateOne(
              {
                panel_id: panel.panel_id
              },
              {
                $set: panel
              }
            );

            this.msgE(
              `Вы успешно добавили **${role.name}** как следящую роль в этой панели.`
            );
            break;
          case "delete_role":
            this.msgE("Укажите роль для удаления:");

            let role_msg = await this.awaitMessage();
            if (!role_msg?.first())
              return this.msgFalseE("Вы не указали роль.");
            role_msg?.first().delete();
            let role_delete =
              role_msg.first().mentions.roles.first() ||
              this.interaction.guild.roles.cache.get(role_msg.first().content);
            if (!role_delete)
              return this.msgFalseE("Вы указали несуществующую роль.");

            if (!panel.moderator_roles.includes(role_delete.id))
              return this.msgFalseE("Данная роль не является следящей.");

            panel.moderator_roles.splice(
              panel.moderator_roles.indexOf(role_delete.id),
              1
            );
            if (!panel.moderator_roles[0])
              return this.msgFalseE(
                "Должна быть как минимум одна следящая роль."
              );

            this.db.collection("tickets_panels").updateOne(
              {
                panel_id: panel.panel_id
              },
              {
                $set: panel
              }
            );
            this.msgE(
              `Вы успешно удалили **${role_delete.name}** из списка следящих ролей.`
            );
            break;
        }

        break;
      case "category":
        this.msgE("Укажите айди категории для создания тикетов этой панели:");

        let category_message = await this.awaitMessage();
        if (!category_message?.first())
          return this.msgFalseE("Вы не указали новую категорию.");

        category_message.first().delete();

        let category = Bot.bot.channels.cache.get(
          category_message.first().content
        );

        if (!category || category.type !== "GUILD_CATEGORY")
          return this.msgFalseE("Вы указали несуществующую категорию.");

        panel.ticket_category = category.id;

        this.db.collection("tickets_panels").updateOne(
          {
            panel_id: panel.panel_id
          },
          {
            $set: panel
          }
        );
        this.msgE(
          `Вы успешно установили категорию **${category.name}** для создания тикетов.`
        );
        break;

      case "description":
        this.msgE("Укажите описание для указанной панели:");

        let category_description = await this.awaitMessage();
        if (!category_description?.first())
          return this.msgFalseE("Вы не указали описание панели.");

        category_description.first().delete();
        let description = category_description.first().content;

        if (!description)
          return this.msgFalseE("Вы не указали описание панели.");

        panel.panel_description = description;

        this.updatePanel(panel);

        this.msgE(
          `Вы успешно установили описание панели **${panel.panel_name}**.`
        );
        break;
    }
  }

  async awaitMessage() {
    let filter = msg => msg.author.id === this.interaction.member.id;

    let msg = await this.interaction.channel
      .awaitMessages({
        filter,
        max: 1,
        time: 180000,
        errors: ["time"]
      })
      .catch(err => {
        return this.msgFalseE("Вы не указали новое название.");
      });

    return msg;
  }
}

module.exports = Command;
