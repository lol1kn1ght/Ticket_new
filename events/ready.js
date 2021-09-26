module.exports = function(args) {
  class Event {
    constructor(args) {
      Object.assign(this, args);
    }

    async execute() {
      console.log(`\n${Bot.bot.user.tag} Запущен успешно.`);
    }
  }

  new Event(args).execute();
};
