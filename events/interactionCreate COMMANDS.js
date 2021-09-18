module.exports = function (args, interaction) {
  class Event {
    constructor(args) {
      Object.assign(this, args);
      this.interaction = interaction;
    }

    async execute() {
      if (!this.interaction.isCommand()) return;

      let Command = this.commands[this.interaction.commandName];

      if (!Command) return;
      let command = new Command(args, this.interaction);
      command.execute();
    }
  }

  new Event(args).execute();
};
