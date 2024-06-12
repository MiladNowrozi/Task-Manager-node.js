import fs, { access } from "fs";
import "dotenv/config";

import inquirer from "inquirer";

import chalk from "chalk";
import { parse, stringify } from "csv/sync";

import DB from "./db.js";
import Task from "./task.js";

const error = chalk.redBright.bold;
const warn = chalk.yellowBright.bold;
const success = chalk.greenBright.bold;

export default class Action {
  static List() {
    const tasks = Task.GetAllTask(true);
    if (tasks.length) {
      console.table(tasks);
    } else {
      console.log(warn("There is not any task."));
    }
  }

  static async Add() {
    const answer = await inquirer.prompt(
      {
        type: "input",
        name: "title",
        message: "Enter task title:",
        validate(valve) {
          if (valve.length < 3) {
            return "The title must contain at least 3 letters ";
          }
          return true;
        },
      },
      {
        type: "confirm",
        name: "completed",
        message: "Is this task completed?",
        default: false,
      }
    );
    try {
      const task = new Task(answer.title, answer.completed);
      task.save();
      console.log(success("New task saved successfully."));
    } catch (e) {
      console.log(error(e.message));
    }
  }

  static async Delete() {
    const tasks = Task.GetAllTask();
    const choices = [];
    for (let task of tasks) {
      choices.push(task.title);
    }
    const answer = await inquirer.prompt({
      type: "list",
      name: "title",
      message: "Select a task to Delete. ",
      choices,
    });
    const task = Task.GetTaskByTitle(answer.title);
    try {
      DB.DeleteTaskById(task.id);
      console.log(success("Selected task deleted successfully."));
    } catch (e) {
      throw new Error(e.message);
    }
  }

  static async DeleteAllTask() {
    const answer = await inquirer.prompt({
      type: "confirm",
      name: "result",
      message: "Are you sure for all tasks?",
    });
    if (answer.result) {
      try {
        DB.resetDB();
        console.log(success("All tasks deleted successfully."));
      } catch (e) {
        console.log(error(e.message));
      }
    }
  }

  static async Edit() {
    const tasks = Task.GetAllTask();
    const choices = [];
    for (let task of tasks) {
      choices.push(task.title);
    }
    const SelectedTask = await inquirer.prompt({
      type: "list",
      name: "title",
      message: "Select a task to edit",
      choices,
    });

    const task = DB.GetTaskByTitle(SelectedTask.title);

    const answer = await inquirer.prompt(
      {
        type: "input",
        name: "title",
        message: "input task name new",
        validate(valve) {
          if (valve.length < 3) {
            return "The title must contain at least 3 letters";
          }
          return true;
        },
        default: task.title,
      },
      {
        type: "confirm",
        name: "completed",
        message: "Is this task completed? ",
        default: false,
      }
    );

    try {
      DB.SaveTask(answer.title, answer.completed, task.id);
      console.log(success("Selected task edited successfully"));
    } catch (e) {
      console.log(error(e.message));
    }
  }

  static async Export() {
    const answer = await inquirer.prompt({
      type: "input",
      name: "filename",
      message: "Enter output filename:",
      validate: (value) => {
        if (!/^[\w .-]{1,50}$/.test(value)) {
          return "Please enter a valid filename.";
        }
        return true;
      },
    });

    const tasks = Task.GetAllTask(true);

    const output = stringify(tasks, {
      header: true,
      cast: {
        boolean: (value, context) => {
          return String(value);
        },
      },
    });

    try {
      fs.writeFileSync(answer.filename, output);
      console.log(success("Tasks exported successfully."));
    } catch (e) {
      console.log(error("can not write to" + answer.filename));
    }
  }

  static async Import() {
    const answer = await inquirer.prompt({
      type: "input",
      name: "filename",
      message: "Enter output filename:",
    });
    if (fs.existsSync(answer.filename)) {
      try {
        const input = fs.readFileSync(answer.filename);
        const data = parse(input, {
          columns: true,
          cast: (value, context) => {
            if (context.column === "id") {
              return Number(value);
            } else if (context.column === "completed") {
              return value.toLowerCase() === "true" ? true : false;
            }
            return value;
          },
        });
        DB.insertBulkData(data);
        console.log(success("Data imported successfully."));
      } catch (e) {
        console.log(error(e.message));
      }
    } else {
      console.log(error("Specified file does not exists."));
    }
  }
  static async Download() {
    const baseURL = process.env.BASE_URL;

    const answer = await inquirer.prompt({
      type: "input",
      name: "filename",
      message: "Enter filename to download.",
    });

    const config = {
      baseURL,
      url: answer.filename,
    };
    try {
      const response = await axios(config);
      const data = parse(response.data, {
        columns: true,
        cast: (value, context) => {
          if (context.column === "id") {
            return Number(value);
          } else if (context.column === "completed") {
            return value.toLowerCase() === "true" ? true : false;
          }
          return value;
        },
      });
      DB.insertBulkData(data);
      console.log(success("Data downloaded to database successfully."));
      console.table(data);
    } catch (e) {
      console.log(error(e.message));
    }
  }
}
