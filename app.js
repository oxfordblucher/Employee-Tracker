const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
require('dotenv').config();

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.DB_password,
    database: "employees_DB"
});

connection.connect(function(err) {
    if (err) throw err;
    runApp();
});

function runApp() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "What would you like to do?",
            choices: [
                "Add data",
                "View data",
                "Update data",
                "Exit"
            ]
        })
        .then(function(answer) {
            switch (answer.action) {
                case "Add data":
                    addData();
                    break;

                case "View data":
                    viewData();
                    break;
                case "Update data":
                    updateData();
                    break;
                case "Exit":
                    break;
            }
        })
};

function addData() {
    inquirer
        .prompt({
            name: "type",
            type: "list",
            message: "And what will we be adding?",
            choices: [
                "Add department",
                "Add role",
                "Add employee",
                "Previous menu"
            ]
        })
        .then(function(answer) {
            switch (answer.type) {
                case "Add department":
                    newDept();
                    break;
                case "Add role":
                    newRole();
                    break;
                case "Add employee":
                    newEmployee();
                    break;
                case "Previous menu":
                    runApp();
                    break;
            }
        })
}

function viewData() {

}

function updateData() {

}