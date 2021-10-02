const Discord = require("discord.js");
const fs = require("fs");
module.exports = function(args, interaction) {
  class Event {
    constructor(args) {
      this.interaction = interaction;
      this.message = this.interaction?.message;
      Object.assign(this, args);
    }

    async execute() {
      this.db = this.mongo.db("gtaEZ");
      let methods = [
        "close_ticket",
        "open_ticket",
        "delete_ticket",
        "archieve_ticket"
      ];

      if (
        !this.interaction.isButton() ||
        !methods.includes(this.interaction.customId)
      )
        return;

      await this.interaction.update({
        components: interaction.message.components
      });

      let panels_db = this.db.collection("tickets_panels");
      let panels_data = await panels_db.find().toArray();
      let current_ticket, panel;

      for (var panel_curr of panels_data) {
        var ticket_filter = []
          .concat(
            panel_curr.actieve_tickets || [],
            panel_curr.closed_tickets || []
          )
          .flat()
          .filter(
            ticket =>
              ticket.ticket_message === this.message.id ||
              ticket.ticket_channel === this.message.channel.id
          )[0];

        if (ticket_filter) {
          current_ticket = ticket_filter;
          panel = panel_curr;
        }
      }

      if (!panel || !current_ticket) return;

      let reaction_channel = this.message.channel;
      let guild = this.interaction.guild;
      let ticket_author = this.interaction.member;
      let ticket_owner = guild.members.cache.get(current_ticket.owner);

      let reaction_message = this.message;

      // console.log(reaction_message);
      let interact_author = this.interaction.member;

      if (
        !interact_author.roles.cache
          .filter(role => panel.moderator_roles.includes(role.id))
          .first() &&
        interact_author.id !== current_ticket.owner
      )
        return;

      switch (this.interaction.customId) {
        case "close_ticket":
          if (current_ticket.status !== "actieve") return;

          let close_buttons = [
            new Discord.MessageButton({
              type: "BUTTON",
              label: "✅ Уверен",
              customId: "yes",
              style: 2,
              disabled: false
            }),
            new Discord.MessageButton({
              type: "BUTTON",
              label: "❌ Нет",
              customId: "no",
              style: 2,
              disabled: false
            })
          ];

          var close_message = await reaction_channel.send({
            content: `${interact_author}, Вы точно хотите закрыть тикет?`,
            components: [
              new Discord.MessageActionRow().addComponents(...close_buttons)
            ]
          });

          let close_answer = await close_message
            .awaitMessageComponent(
              button =>
                !button.user.bot &&
                methods.includes(button.customId) &&
                (button.user.id === current_ticket.owner ||
                  guild.members.cache
                    .get(user.id)
                    .roles.cache.filter(role =>
                      panel.moderator_roles.includes(role.id)
                    )
                    .first()),
              {
                max: 1,
                time: 1000,
                errors: ["time"]
              }
            )
            .catch(e => {
              reaction_channel.send(`${ticket_author}, Вы не ответили.`);
              return;
            });

          if (!close_answer)
            return reaction_channel.send(`${ticket_author}, Вы не ответили.`);

          if (close_answer.customId === "yes") {
            close_message.delete();

            panel.actieve_tickets.splice(
              panel.actieve_tickets.indexOf(current_ticket),
              1
            );

            current_ticket.status = "inactive";

            reaction_channel.edit({
              name: "закрыт-" + reaction_channel.name.split(`-`)[1]
            });

            let close_embed = new Discord.MessageEmbed()
              .setTitle(panel.panel_name)
              .setColor(this.config.colorEmbed)
              .setDescription(
                "Управляйте вашим тикетом через кнопки ниже:" // :page_facing_up: - Записать сообщения
              );

            let manage_buttons = [
              new Discord.MessageButton({
                type: "BUTTON",
                label: "🔓 Открыть",
                customId: "open_ticket",
                style: 2,
                disabled: false
              }),
              new Discord.MessageButton({
                type: "BUTTON",
                label: "🗑️ Удалить тикет",
                customId: "delete_ticket",
                style: 2,
                disabled: false
              }),
              new Discord.MessageButton({
                type: "BUTTON",
                label: "📄 Архивировать тикет",
                customId: "archieve_ticket",
                style: 2,
                disabled: false
              })
            ];

            let close_msg = await reaction_channel.send({
              embeds: [close_embed],
              components: [
                new Discord.MessageActionRow().addComponents(...manage_buttons)
              ]
            });

            current_ticket.manage_message = close_msg.id;

            panel.closed_tickets
              ? panel.closed_tickets.push(current_ticket)
              : (panel.closed_tickets = [current_ticket]);

            panels_db.updateOne(
              {
                panel_id: panel.panel_id
              },
              {
                $set: panel
              }
            );
          }

          if (close_answer.customId === "no") {
            close_message.delete();

            return;
          }

          break;

        case "open_ticket":
          if (
            current_ticket.status !== "inactive" ||
            this.message.id !== current_ticket.manage_message
          )
            return;

          panel.closed_tickets.splice(
            panel.closed_tickets.indexOf(current_ticket),
            1
          );

          current_ticket.status = "actieve";

          panel.actieve_tickets
            ? panel.actieve_tickets.push(current_ticket)
            : (panel.actieve_tickets = [current_ticket]);

          reaction_channel.edit({
            name: "открыт-" + reaction_channel.name.split(`-`)[1]
          });

          panels_db.updateOne(
            {
              panel_id: panel.panel_id
            },
            {
              $set: panel
            }
          );

          try {
            let manage_message = this.message;

            manage_message.delete().catch(e => {});
          } catch (e) {}

          reaction_channel.send(
            `:white_check_mark: ${this.interaction.member}, Вы успешно открыли тикет заново.`
          );
          // .then((successful_msg) => successful_msg.delete({ timeout: 5000 }));
          break;

        case "delete_ticket":
          if (
            current_ticket.status !== "inactive" ||
            this.message.id !== current_ticket.manage_message
          )
            return;

          panel.closed_tickets.splice(
            panel.closed_tickets.indexOf(current_ticket),
            1
          );
          panel.deleted_tickets
            ? panel.deleted_tickets.push(current_ticket)
            : (panel.deleted_tickets = [current_ticket]);

          try {
            let manage_message = this.message;

            manage_message.delete().catch(e => {});
          } catch (e) {}

          reaction_channel.send(
            ":warning: Тикет будет удален через пару секунд."
          );

          setTimeout(() => {
            reaction_channel.delete().catch(e => {});

            panels_db.updateOne(
              {
                panel_id: panel.panel_id
              },
              {
                $set: panel
              }
            );
          }, 5000);
          break;

        case "archieve_ticket":
          let messages = await this.getMessages();

          let transcript = `Владелец тикета: ${ticket_owner.user.tag} (${ticket_owner.id})\nПанель: ${panel.panel_name} (${panel.panel_id})\nТикет: ${reaction_channel.name}\n\n`;
          let current_author;
          let reports_channel = false;
          // guild.channels.cache.get(
          //   this.config.reports_channel
          // );

          for (let msg of messages) {
            if (current_author !== msg.author)
              transcript += `\n\nАвтор: ${msg.author.tag} (${msg.author.id}):\n`;

            let msg_date = new Date(msg.createdTimestamp);

            current_author = msg.author;
            transcript +=
              `${msg_date.toLocaleTimeString()} ${msg_date.toLocaleDateString()}  |   ` +
              msg.content +
              "\n";

            if (msg.attachments.first())
              transcript += `${msg_date.toLocaleTimeString()} ${msg_date.toLocaleDateString()}  |   ${msg.attachments
                .map(attach => attach)
                .map(image => `[Файл: ${image.url}]`)
                .join(", ")}]\n`;
          }

          let save_message = await reaction_channel.send(
            `Сохраняю логи сообщений 📝`
          );
          fs.writeFile(
            `./data/tickets/logs/${current_ticket.owner}_${reaction_channel.id}.txt`,
            transcript,
            function(err) {
              if (err) throw err;
              save_message.edit("Сохранение прошло успешно :white_check_mark:");
              reaction_channel.send({
                content: "Ваши логи сообщений:",
                files: [
                  `./data/tickets/logs/${current_ticket.owner}_${reaction_channel.id}.txt`
                ]
              });

              if (reports_channel) {
                reports_channel.send(
                  `Вложения к тикету ${reaction_channel} (${panel.panel_name} [${panel.panel_id}]: ${current_ticket.owner})`,
                  {
                    files: [
                      `./data/tickets/logs/${current_ticket.owner}_${reaction_channel.id}.txt`
                    ]
                  }
                );
              }
            }
          );
          break;
      }
    }

    async getMessages(messages = []) {
      await (async () => {
        let fetch = await this.message.channel.messages.fetch({
          before: messages[0]?.id
        });

        if (!fetch.first()) return messages;
        messages.push(...fetch.map(msg => msg).reverse());

        await this.getMessages(messages);
      })();

      return messages;
    }
  }

  new Event(args).execute();
};
