const Discord = require("discord.js");
const {Intents} = require("discord.js");
const {REST} = require("@discordjs/rest");
const {Routes} = require("discord-api-types/v9");
const config = require("./config/config.json");
const {token} = require("./config/token.json");
const {MongoClient} = require("mongodb");
const {promisify} = require("util");
const f = require("./config/modules");
const fs = require("fs");

const connect_mongo = promisify(MongoClient.connect);
const Client = new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

class Bot_builder {
  constructor() {
    this.bot = Client;
    this.Mongo = MongoClient;
    this.mongo;
    this.config = config;
    this.commands = {};
    this.slash = [];
    this._launch();
  }

  async _launch() {
    let timer = this._timer();

    await this._load_mongodb();

    await this._load_commands();

    await this._load_events();

    await this._login();

    await this._load_slash();
    timer.stop();
  }

  async _load_mongodb() {
    try {
      if (this.config.mongo.auth) {
        let {user, pass, ip} = this.config.mongo;

        this.mongo = await connect_mongo(
          `mongodb://${user}${pass}${ip}:27017${dbauth}`
        );
        console.log(`Успешно подключен к базе данных: ${ip}:27017`);
      } else {
        this.mongo = await connect_mongo(`mongodb://localhost:27017`);
        console.log(`Успешно подключен к базе данных: localhost:27017`);
      }
    } catch (e) {
      console.log("Ошибка при соединении с базой данных:");
      throw e;
    }
  }

  async _load_commands() {
    let readdir = promisify(fs.readdir);

    let commands_dir = await readdir("./commands");
    let commands = commands_dir.filter(command_file =>
      command_file.endsWith(".js")
    );

    let step = this._percent(commands.length, "Комманды");

    for (let command_file of commands) {
      let command_name = command_file.replace(".js", "");

      try {
        let Command = require(`./commands/${command_file}`);
        let command = new Command();

        this.commands[command.options?.slash.name] = Command;

        this.slash.push(command.options?.slash);
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

    let step = this._percent(events.length, "Евенты");

    for (let event_file of events) {
      let event_name = event_file.split(` `)[0].replace(".js", "");

      try {
        let event = require(`./events/${event_file}`);

        let args = {
          commands: this.commands,
          config: this.config,
          f: f,
          mongo: this.mongo
        };

        this.bot.on(event_name, event.bind(null, args));
      } catch (e) {
        console.log(`Ошибка в евенте ${event_name}:`);
        console.log(e);
      }
      step();
    }
  }

  async _load_slash() {
    let rest = new REST({version: "9"}).setToken(token);

    try {
      console.log("Начал загрузку /-команд.");
      await rest.put(
        Routes.applicationGuildCommands(this.bot.user.id, config.slash_guild),
        {
          body: this.slash
        }
      );

      console.log("Успешно загрузил /-команды.");
    } catch (error) {
      console.log("Ошибка при загрузке /-команд:");
      console.error(error.rawError.errors["0"]);
    }
  }

  _timer() {
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

  _percent(amount = 1, module_name = "TEST") {
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

global.Bot = new Bot_builder();
