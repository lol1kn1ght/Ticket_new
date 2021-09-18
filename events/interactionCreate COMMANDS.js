module.exports = function (args, interaction) {
  class Event {
    constructor(args) {
      Object.assign(this, args);
      this.interaction = interaction;
    }

    async execute() {
      console.log(this.interaction);
    }
  }

  new Event(args).execute();
};
