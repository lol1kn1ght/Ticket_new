const Discord = require("discord.js");
const {Intents} = require("discord.js");
const {REST} = require("@discordjs/rest");
const {Routes} = require("discord-api-types/v9");
const config = require("./config/config.json");
const {token} = require("./config/token.json");
const Mongo = require("mongodb");
const {promisify} = require("util");
const f = require("./config/modules");
const fs = require("fs");
const Client = new Discord.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
});

class Bot_builder {
  constructor() {
    this.bot = Client;
    this.Mongo = Mongo;
    this.config = config;
    this.commands = {};
    this._launch();
  }

  async _launch() {
    let timer = this.timer();

    await this._load_commands();

    await this._load_events();

    await this._login();

    timer.stop();
  }

  async _load_commands() {
    let readdir = promisify(fs.readdir);

    let commands_dir = await readdir("./commands");
    let commands = commands_dir.filter(command_file =>
      command_file.endsWith(".js")
    );

    let step = this.percent(commands.length, "Комманды");

    for (let command_file of commands) {
      let command_name = command_file.replace(".js", "");

      try {
        let command = require(`./commands/${command_file}`);

        this.commands[command_name] = command;
      } catch (e) {
        console.log(`Ошибка в команде ${command_name}:`);
        console.log(e);
      }
      step();
    }
  }

  async _load_events() {
    let readdir = promisify(fs.readdir);

    let events_dir = await readdir("./events");
    let events = events_dir.filter(event_file => event_file.endsWith(".js"));

    let step = this.percent(events.length, "Евенты");

    for (let event_file of events) {
      let event_name = event_file.split(` `)[0];

      try {
        let event = require(`./events/${event_file}`);

        this.bot.on(
          event_name,
          event.bind(null, {commands: this.commands, config: this.config, f: f})
        );
      } catch (e) {
        console.log(`Ошибка в евенте ${event_name}:`);
        console.log(e);
      }
      step();
    }
  }

  timer() {
    let P = ["\\", "|", "/", "-"];
    let x = 0;
    return {
      _timer_interval: setInterval(function() {
        process.stdout.write("\r" + P[x++]);
        x &= 3;
      }, 250),
      stop: function(params) {
        clearInterval(this._timer_interval);

        process.stdout.write("\rЗагрузка прошла успешно!\n");
      }
    };
  }

  percent(amount = 1, module_name = "TEST") {
    let current_step = 1;

    function next_step() {
      let current_percent = (current_step++ / amount) * 100;

      process.stdout.write(
        `\r  Загрузка модуля "${module_name}" - ${Math.floor(current_percent)}%`
      );
      if (current_percent >= 100)
        console.log(`\n  Успешно закончена загрузка модуля "${module_name}"`);
    }

    return next_step;
  }

  async _login() {
    await this.bot.login(token);
  }
}

new Bot_builder();
