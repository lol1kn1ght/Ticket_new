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
        name: "delete-panel",
        description: "удалить существующую панель."
      }
    };
  }

  async execute() {
    this.db = this.mongo.db("gtaEZ");

    let panels_db = this.db.collection("tickets_panels");
    let panels_data = await panels_db.find().toArray();

    if (!panels_data[0])
      return this.msgFalseH("Панелей не найдено. Создайте новую.");

    let menu_buttons = [];
    let num = 0;
    let field_page = 0;
    let pages_menu = [];

    for (let panel of panels_data) {
      let menu_field = {
        label: panel.panel_name, //
        description: `Айди панели: ${panel.panel_id}`, //
        value: `delete_${panel.panel_id}`
      };
      if (pages_menu[field_page]) pages_menu[field_page].push(menu_field);
      else pages_menu[field_page] = [menu_field];

      if (num > 3) {
        num = 0;
        field_page++;
      }
    }

    let menu_row = new Discord.MessageActionRow();

    let menu_page = 1;
    for (let page of pages_menu) {
      let menu = new Discord.MessageSelectMenu()
        .setCustomId(`${++menu_page}_delete-panel`)
        .setPlaceholder("Выберите панель из списка что бы удалить ее:")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(page);

      menu_row.addComponents(menu);
    }

    let select_message = await this.msg(
      "Выберите панель для удаления из списка ниже.",
      {
        components: [menu_row],
        fetchReply: true
      }
    );

    this.select_message = select_message;
    this.create_collector(select_message);
    return;
  }

  async create_collector(select_message) {
    if (!select_message) throw new Error("Нету сообщения с меню выбора");

    let collector = select_message.createMessageComponentCollector(
      select => select.member.id === this.interaction.member.id,
      {
        max: 1,
        time: 180000,
        componentType: "SELECT_MENU",
        maxComponents: 1
      }
    );

    collector.on("end", collected => {
      if (!collected.first()) {
        this.msgFalseE(
          "Вы не выбрали панель для удаления.\nСообщение удалится через **10** секунд."
        );
      }
    });

    collector.on("collect", async select => {
      if (
        !select.isSelectMenu() ||
        select.message.interaction.id !== this.interaction.id
      )
        return console.log("НЕ СЕЛЕКТ МЕНЮ");

      let values = select.values[0]?.split("_");
      let method = values[0];
      let panel_id = Number(values[1]);
      if (!method || isNaN(panel_id))
        return this.msgFalseE(
          "При удалении панели возникла ошибка, обратитесь к администрации. (0)"
        );
      if (method !== "delete") return;

      await select.update({components: undefined});
      await this.msgE("Начинаю процесс удаления сообщения:", {components: []});
      this.delete_panel(panel_id);
      collector.stop();
    });
  }

  async delete_panel(panel_id) {
    let panels_db = this.db.collection("tickets_panels");
    let panels_data = await panels_db.find().toArray();

    let panel = panels_data.filter(panel => panel.panel_id === panel_id)[0];
    if (!panel)
      return this.msgFalseH(
        "При удалении панели возникла ошибка, обратитесь к администрации. (1)"
      );

    await this.msgE("Ищу старое сообщение с панелью.");

    let old_channel = this.interaction.guild.channels.cache.get(
      panel.panel_channel
    );

    let old_message = await old_channel?.messages
      ?.fetch(panel.panel_message)
      .catch(e => {});

    if (old_message) {
      await this.msgE("Удаляю указанную панель.");

      try {
        await old_message
          .delete({timeout: 1000})
          .catch(e => console.log("ОШЫБКА"));
        panels_db.deleteOne({
          panel_id: panel.panel_id
        });
        await this.msgE("Успешно удалена панель.");
      } catch (e) {
        await this.msgFalseE(
          "У меня недостаточно прав для удаления панели.\nВыдайте мне права для удаления сообщений или доступ к каналу сообщением панели."
        );
      }
    } else {
      await this.msgE("Сообщение панели не найдено.\nПанель удалена.");
      panels_db.deleteOne({
        panel_id: panel.panel_id
      });
    }
  }

  getLastNumbers(number) {
    let reverse = number.split("").reverse();
    return `${reverse[0]}${reverse[1]}${reverse[2]}${reverse[3]}`;
  }
}

module.exports = Command;
