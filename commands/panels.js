const {Command_template} = require("../config/templates");
const Discord = require("discord.js");

class Command extends Command_template {
  constructor(args, interaction) {
    super(interaction);
    Object.assign(this, args);

    this.options = {
      permissions: ["ADMINISTRATOR"],
      custom_perms: [],
      slash: {
        name: "panels",
        description: "выводит список всех панелей"
      }
    };
  }

  async execute() {
    this.db = this.mongo.db("gtaEZ");
    let panels_db = this.db.collection("tickets_panels");
    let panels_data = await panels_db.find().toArray();

    let embeds = await this.f.getpanels(panels_data, this.interaction);

    if (!embeds[0]) return this.msgFalseH("Список панелей пуст.");
    this.f.pages({
      interaction: this.interaction,
      pages: embeds,
      filter: interaction =>
        interaction.member.id === this.interaction.member.id
    });
  }
}

module.exports = Command;
