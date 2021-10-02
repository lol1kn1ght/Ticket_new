const Discord = require("discord.js");

module.exports = function(args, interaction) {
  class Event {
    constructor(args) {
      this.interaction = interaction;
      this.message = interaction.message;
      this.channel = interaction.channel;
      Object.assign(this, args);
    }

    async execute() {
      this.db = this.mongo.db("gtaEZ");

      if (
        !this.interaction.isButton() ||
        this.interaction.customId !== "create_ticket"
      )
        return;

      this.interaction.update({
        components: this.message.components
      });

      let panels_db = this.db.collection("tickets_panels");
      let panels_data = await panels_db.find().toArray();

      let panel = panels_data.filter(
        panel => panel.panel_message === this.message.id
      )[0];

      if (!panel) return;

      let guild = this.interaction.guild;
      let interaction_author = this.interaction.member;
      let reaction_channel = this.interaction.channel;

      let user_ticket = panel.actieve_tickets?.filter(
        ticket => ticket.owner === interaction_author.id
      )[0];
      if (user_ticket)
        return this.send(
          `${interaction_author}, У вас уже есть один активный тикет в данной категории. Закройте его перед созданием нового.`
        );

      let actieve_tickets = panels_data
        .filter(panel => panel.actieve_tickets)
        .map(panel => panel.actieve_tickets)
        .flat();

      let positions = actieve_tickets.map(ticket => ticket.position).sort();
      let position = (positions[positions.length - 1] || 0) + 1;

      let ticket_name = `000` + position;
      let moderators_permissions = panel.moderator_roles.map(role => {
        return {
          id: role,
          allow: ["VIEW_CHANNEL"]
        };
      });

      let Permissions = Discord.Permissions;
      let ticket_channel = await guild.channels
        .create(`открыт-${ticket_name.slice(-3)}`, {
          permissionOverwrites: [
            ...moderators_permissions,
            {
              id: guild.id,
              deny: [Permissions.FLAGS.VIEW_CHANNEL]
            },
            {
              id: interaction_author.user.id,
              allow: [Permissions.FLAGS.VIEW_CHANNEL]
            },
            {
              id: Bot.bot.user.id,
              allow: [Permissions.FLAGS.VIEW_CHANNEL]
            }
          ],
          parent: panel.ticket_category
        })
        .catch(e => {
          console.log(e);

          return;
          this.send(
            `${interaction_author}, У меня недостаточно прав для создания каналов. Обратитесь к администрации.`
          );
        });

      if (!ticket_channel) return this.send("Произошла ошибка (1)");

      this.send(
        `${interaction_author}, Создал тикет для вас в ${ticket_channel}`
      );

      let ticket_embed = new Discord.MessageEmbed()
        .setTitle(panel.panel_name)
        .setDescription("Следящие скоро прибудут! Опишите вашу проблему.")
        .setFooter(
          "Что бы закрыть тикет нажмите на соответствующую кнопку ниже."
        )
        .setColor(this.config.colorEmbed);

      let manage_buttons = [
        new Discord.MessageButton({
          type: "BUTTON",
          label: "🔒 Закрыть тикет",
          customId: "close_ticket",
          style: 2,
          disabled: false
        })
      ];

      let ticket_message = await ticket_channel.send({
        content: `${interaction_author}, Добро пожаловать.`,
        embeds: [ticket_embed],
        components: [
          new Discord.MessageActionRow().addComponents(...manage_buttons)
        ],
        fetchReply: true
      });

      ticket_message.pin({reason: "Панель тикета"});

      let ticket_data = {
        owner: interaction_author.user.id,
        ticket_channel: ticket_channel.id,
        status: "actieve",
        position: position,
        ticket_message: this.message.id
      };

      panel.actieve_tickets
        ? panel.actieve_tickets.push(ticket_data)
        : (panel.actieve_tickets = [ticket_data]);

      panels_db.updateOne(
        {
          panel_id: panel.panel_id
        },
        {
          $set: panel
        }
      );
    }

    async send(content) {
      this.channel.send(content).then(msg => {
        setTimeout(() => {
          msg.delete();
        }, 10000);
      });
    }
  }

  new Event(args).execute();
};
