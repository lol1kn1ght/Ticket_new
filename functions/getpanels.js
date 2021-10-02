const Discord = require("discord.js");
const config = require("../config/config");
module.exports = (panels_data, interaction) => {
  if (!panels_data[0]) return [];

  let fields = [];
  let num = 1;
  let curr_page = 0;
  let embeds = [];

  for (let panel of panels_data) {
    let all_tickets = [].concat(
      panel.actieve_tickets || [],
      panel.closed_tickets || [],
      panel.deleted_tickets || []
    );

    let panel_field = {
      name: `${panel.panel_name} - Всего тикетов: **${all_tickets.length}**\n`,
      value: `Активных тикетов: **${panel.actieve_tickets?.length ||
        0}**\nЗакрытых тикетов: **${
        (panel.closed_tickets || []).concat(panel.deleted_tickets || []).length
      }**\n[Ссылка](https://discord.com/channels/${interaction.guild.id}/${
        panel.panel_channel
      }/${panel.panel_message}) `
    };

    if (fields[curr_page]) fields[curr_page].push(panel_field);
    else fields[curr_page] = [panel_field];

    if (num >= 5) {
      curr_page++;
      num = 1;
    }

    num++;
  }

  for (let field of fields) {
    let page_embed = new Discord.MessageEmbed({
      fields: field,
      color: config.colorEmbed,
      title: "Список панелей тикетов:",
      footer: {
        text: interaction.member.user.tag
      },
      timestamp: new Date(),
      thumbnail: {
        url: interaction.guild.iconURL({dynamic: true})
      }
    });

    embeds.push(page_embed);
  }

  return embeds;
};
