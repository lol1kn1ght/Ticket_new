module.exports = class Steal_Car {
  constructor(args) {
    if (!args.user || !args.db || !args.car)
      throw new Error("Один из аргументов не указан");

    Object.assign(this, args);
  }

  async execute() {}
};
