import util from "util";

import chalk from "chalk";

import DB from "./db.js";

export default class Task {
  #id = 0;
  #title;
  #completed;

  constructor(title, completed = false) {
    this.title = title;
    this.completed = completed;
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  set title(value) {
    if (typeof value === Number || value.length < 3) {
      throw new Error("title must contain at least 3 letters.");
    }
    this.#title = value;
  }

  get completed() {
    return this.#completed;
  }

  set completed(value) {
    this.#completed = Boolean(value);
  }

  [util.inspect.custom]() {
    return `Task {
      id: ${chalk.yellowBright(this.id)}
      title: ${chalk.green('"' + this.title + '"')}
      completed: ${chalk.blueBright(this.completed)}

}`;
  }

  save() {
    try {
      const id = DB.SaveTask(this.#title, this.#completed, this.#id);
      this.#id = id;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  static GetTaskById(id) {
    const task = DB.GetTaskById(id);
    if (task) {
      const item = new Task(task.title, task.completed);
      item.#id = task.id;
      return item;
    } else {
      return false;
    }
  }
  static GetTaskByTitle(title) {
    const task = DB.GetTaskByTitle(title);
    if (task) {
      const item = new Task(task.title, task.completed);
      item.#id = task.id;
      return item;
    } else {
      return false;
    }
  }
  static GetAllTask(rawObject = false) {
    const tasks = DB.GetAllTask();
    if (rawObject) {
      return tasks;
    }
    const items = [];
    for (let task of tasks) {
      const item = new Task(task.title, task.completed);
      item.#id = task.id;
      items.push(item);
    }
    return items;
  }
}
