module.exports = class Profile {
  constructor(db, user) {
    if (!db || !user) throw new Error("Один из аргументов не указан.");

    this.db = db;
    this.user = user;
    this._user_id = this.user?.author?.id || this.user?.id || this.user;
    this._user_data = {};
    this._get_data();
  }

  get data() {
    if (!this._user_data) {
      return new Promise(async resolve => {
        await this._get_data();
        resolve(this._user_data);
      });
    }

    return this._user_data || {};
  }

  get coins() {
    if (!this._user_data.login) {
      return new Promise(async resolve => {
        let result = await this._get_data();
        resolve(result.coins || 0);
      });
    }

    return new Promise(async resolve => {
      resolve(this._user_data.coins || 0);
    });
  }

  async add_money(amount) {
    if (isNaN(amount)) throw new Error("Аргуемент не является числом.");

    if (!this._user_data.login) {
      let new_data = await this._get_data();
      let result = await this.update_data({
        coins: (new_data.coins || 0) + amount
      });

      return result.coins;
    }

    let result = await this.update_data({
      coins: (this._user_data.coins || 0) + amount
    });

    return result.coins;
  }

  async remove_money() {
    if (isNaN(amount)) throw new Error("Аргуемент не является числом.");

    if (!this._user_data.login) {
      let new_data = await this._get_data();

      let total = new_data.coins - amount;
      if (total < 0 || isNaN(total)) total = 0;

      let result = await this.update_data({
        coins: total
      });

      return result.coins;
    }

    let total = this._user_data?.coins - amount;
    if (total < 0 || isNaN(total)) total = 0;

    let result = await this.update_data({
      coins: total
    });

    return result.coins;
  }

  async _get_data() {
    let user_data = await this.db.collection("users").findOne({
      login: this._user_id
    });

    this._user_data = user_data || {};
    return this._user_data;
  }

  async update_data(data) {
    if (!data) throw new Error("Данные для изменения не указаны.");

    if (!this._user_data.login) {
      data.login = this._user_id;
      await this.db.collection("users").insertOne(data);

      let new_data = await this._get_data();

      return new_data;
    }

    await this.db
      .collection("users")
      .updateOne({login: this._user_id}, {$set: data});

    let new_data = await this._get_data();
    return new_data;
  }
};
