const {Command_template} = require("../config/templates");
const Discord = require("discord.js");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);

    this.options = {
      permissions: [],

      channels: [],
      custom_perms: ["OWNER"],
      slash: {
        name: "test",
        description: "Комадна для тестов [BOT_OWNER]"
      }
    };
  }

  async execute() {
    // const {time} = require("@discordjs/builders");
    // const date = new Date();
    //
    // const timeString = time(date.getTime() + 86400000);
    // this.msg(`Сек будет в: ${timeString}`);

    let text = "1";
    let num = 1;
    setInterval(() => {
      text = ++num + ``;
      console.log(text.length);
      console.log(text);
      let menu = new Discord.MessageSelectMenu()
        .setCustomId(text + "")
        .setPlaceholder("Выберите панель из списка что бы удалить ее:")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions([
          {
            label: text,
            description: `Поменять категорию тикетов`,
            value: `${53}_category`
          }
        ]);

      let row = new Discord.MessageActionRow().addComponents(menu);

      this.msg("sadasd", {
        components: [row]
      });
    }, 500);
  }
}

module.exports = Command;
