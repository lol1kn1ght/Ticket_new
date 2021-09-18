module.exports = function(args, interaction) {
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
      let options = command.options;

      if (options.permissions && options.permissions[0]) {
        console.log("есть");
        let member_perms = options.permissions.filter(permission =>
          this.interaction.member.permissions.has(permission.toUpperCase())
        );

        if (!member_perms[0]) {
          console.log("неут");
          if (options.custom_perms && options.custom_perms.includes("OWNER")) {
            if (this.config.owner !== interaction.member.id)
              return this.noPermissions();
          } else return this.noPermissions();
        }
      }

      if (
        options.channels &&
        !options.channels.includes(this.interaction.channelId)
      )
        return this.noPermissions();

      command.execute();
    }

    noPermissions() {
      this.interaction.reply({
        content: "У вас недостаточно прав для использования этой команды!",
        ephemeral: true
      });
    }
  }

  new Event(args).execute();
};
