console.clear();
import dotenv from "dotenv/config";
import chalk from "chalk";
import Action from "./action.js";

const commend = process.argv[2];
const commends = [
  "List",
  "Add",
  "Delete",
  "Delete-all",
  "Edit",
  "Export",
  "Import",
  "Download",
];

const error = chalk.redBright.bold;
const warn = chalk.yellowBright.bold;

if (commend) {
  if (commend === "List") {
    Action.List();
  } else if (commend === "Add") {
    Action.Add();
  } else if (commend === "Delete") {
    Action.Delete();
  } else if (commend === "DeleteAllTask") {
    Action.DeleteAllTask();
  } else if (commend === "Edit") {
    Action.Edit();
  } else if (commend === "Export") {
    Action.Export();
  } else if (commend === "Import") {
    Action.Import();
  } else if (commend === "Download") {
    Action.Download();
  }
} else {
  const message = `${error("Yoe must enter a commend.")}
Available commend are:
${warn(commends.join("\n"))}`;
  console.log(message);
}
