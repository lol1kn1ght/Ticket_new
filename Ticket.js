const Discord = require("discord.js");
const { Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const config = require("./config/config.json");
const { token } = require("./config/token.json");
const Mongo = require("mongodb");
const { promisify } = require("util");
const fs = require("fs");
const Client = new Discord.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
});

class Bot_builder {
  constructor() {
    this.bot = Client;
    this.Mongo = Mongo;
    this.config = config;
    this._launch();
  }

  async _launch() {
    let timer = this.timer();

    this._load_commands();
  }

  async _load_commands() {
    let readdir = promisify(fs.readdir);

    let commands_dir = await readdir("./commands");
    let commands = commands_dir.filter((command_file) =>
      command_file.endsWith(".js")
    );

    let step = this.percent(commands.length, "Комманды");

    for (let command_file of commands) {
      try {
        let command = require(`./commands/${command_file}`);
      } catch (e) {
        console.log(e);
      }
      step();
    }
  }

  timer() {
    let P = ["\\", "|", "/", "-"];
    let x = 0;
    return {
      _timer_interval: setInterval(function () {
        process.stdout.write("\r" + P[x++]);
        x &= 3;
      }, 250),
      stop: function (params) {
        clearInterval(this._timer_interval);

        process.stdout.write("\rЗагрузка прошла успешно!\n");
      },
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
}

new Bot_builder();
