const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
require('dotenv').config();

let employeeList = [];
let chosenID = "";
let roleArray = [];
let newRoleID = "";

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
            type: "list",
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
                    connection.end();
                    break;
            }
        })
};

function addData() {
    inquirer
        .prompt({
            name: "addType",
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
            switch (answer.addType) {
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
    inquirer
        .prompt({
            name: "viewType",
            type: "list",
            message: "What would you like to see?",
            choices: [
                "View department(s)",
                "View role(s)",
                "View employee(s)",
                "Previous menu"
            ]
        })
        .then(function(answer) {
            switch(answer.viewType) {
                case "View department(s)":
                    connection.query("SELECT * FROM department", function(err, res) {
                        console.table(res);
                        runApp();
                    })
                    break;
                case "View role(s)":
                    connection.query("SELECT role.id as Role_ID, department.name as Department, department.id as Dept_ID, role.title as Role, role.salary as Salary FROM role INNER JOIN department ON role.department_id = department.id", function(err, res) {
                        console.table(res);
                        runApp();
                    })
                    break;
                case "View employee(s)":
                    connection.query("SELECT employee.id as Employee_ID, employee.first_name as First, employee.last_name as Last, department.name as Department, department.id as Dept_ID, role.title as Role, role.id as Role_ID, role.salary as Salary, employee.manager_id as Manager_ID FROM ((employee INNER JOIN role on employee.role_id = role.id) INNER JOIN department on role.department_id = department.id);", function(err, res) {
                        console.table(res);
                        runApp();
                    })
                    break;
                case "Previous menu":
                    runApp();
                    break;
            }
        })
}          

function newDept() {
    inquirer
        .prompt({
            name: "deptName",
            type: "input",
            message: "What is the name of your new department?"
        })
        .then(function(answer) {
            connection.query("INSERT INTO department (name) VALUES (?)", answer.deptName, function(err, res) {
                console.log(`${answer.deptName} department added!`);
                runApp();
            })
        });
}

function newRole() {
    let deptArray = [];

    connection.query("SELECT name FROM department", function(err, res) {
        for (let i = 0; i < res.length; i++) {
            deptArray.push(res[i].name);
        };

        inquirer
            .prompt([
                {
                    name: "department",
                    type: "list",
                    message: "What department is this role in?",
                    choices: (deptArray)
                },
                {
                    name: "title",
                    type: "input",
                    message: "What is the role title?",
                },
                {
                    name: "salary",
                    type: "number",
                    message: "What is the salary of this position?",
                    validate: async (number) => {
                        if(NaN) {
                            throw err;
                        }
                        return true;
                    }
                }
            ])
            .then(function(answers) {
                const deptID = parseInt(deptArray.indexOf(answers.department) + 1)
                const newRole = {
                    title: answers.title,
                    salary: answers.salary,
                    department: answers.department,
                    department_id: deptID
                };

                connection.query("INSERT INTO role SET ?", {
                    title: newRole.title, 
                    salary: newRole.salary, 
                    department_id: newRole.department_id
                }, function(err, res) {
                    if(err)throw err;
                    console.log(`${newRole.title} role added to ${newRole.department} department!`);

                    runApp();
                })
            })
    })        
}

function newEmployee() {
    let roleArray = [];

    connection.query("SELECT title FROM role", function(err, res) {
        for (let i = 0; i < res.length; i++) {
            roleArray.push(res[i].title);
        };

        inquirer
            .prompt([
                {
                    name: "role",
                    type: "list",
                    message: "What job position have you filled?",
                    choices: (roleArray)
                },
                {
                    name: "first",
                    type: "input",
                    message: "First name?"
                },
                {
                    name: "last",
                    type: "input",
                    message: "Last name?"
                },
                {
                    name: "manager",
                    type: "number",
                    message: "Their manager's ID if applicable.",
                    filter: (number) => {
                        if (NaN) {
                            return null;
                        }
                    }
                }
            ])
            .then(function(answers) {
                const roleID = parseInt(roleArray.indexOf(answers.role) + 1)
                const newEmployee = {
                    first: answers.first,
                    last: answers.last,
                    role: answers.role,
                    manager: answers.manager
                };

                connection.query("INSERT INTO employee SET ?", {
                    first_name: newEmployee.first,
                    last_name: newEmployee.last,
                    role_id: roleID,
                    manager_id: newEmployee.manager
                }, function(err, res) {
                    if(err) throw err;
                    console.log(`${newEmployee.first} ${newEmployee.last} added to ${newEmployee.role} roster!`);

                    runApp();
                })
            })
    })
}

function updateData() {
    connection.query("SELECT employee.id as Employee_ID, department.name as Department, role.title as Role, employee.first_name as First, employee.last_name as Last, role.salary as Salary, employee.manager_id as Manager_ID FROM ((employee INNER JOIN role on employee.role_id = role.id) INNER JOIN department on role.department_id = department.id);", function(err,res) {
        console.table(res);

        for (let i = 0; i < res.length; i++) {
            const employee = {
                name: `${res[i].First} ${res[i].Last}`,
                id: parseInt(i + 1),
                role: res[i].Role,
                dept: res[i].Department
            }
            employeeList.push(employee);
        }

        inquirer
            .prompt({
                name: "who",
                type: "list",
                message: "Who are you updating?",
                choices: (employeeList)
            })
            .then(function(answers) {
                for (let i = 0; i < employeeList.length; i++) {
                    if(answers.who === employeeList[i].name) {
                        chosenID = employeeList[i].id;
                    };
                }

                inquirer
                    .prompt({
                        name: "updateType",
                        type: "list",
                        message: "Change role or manager?",
                        choices: ['role', 'manager']
                    })
                    .then(function(answer) {
                        switch(answer.updateType) {
                            case "role":
                                updateTitle(chosenID);
                                break;
                            case "manager":
                                updateMgr(chosenID);
                                break;
                        }
                    })
            })
    })
};

function updateTitle(id) {
    connection.query("SELECT title FROM role", function(err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            const newJob = {
                name: res[i].title,
                id: parseInt(i+1)
            }
            roleArray.push(newJob);
        }

        inquirer
            .prompt({
                name: "newJob",
                type: "list",
                message: "What is their new role?",
                choices: (roleArray)
            })
            .then(function(choice) {
                for (let i = 0; i < roleArray.length; i++) {
                    if (choice.newJob === roleArray[i].name) {
                        newRoleID = roleArray[i].id
                    }
                }
                connection.query("UPDATE employee SET ? WHERE ?", [
                    {role_id: newRoleID},
                    {id: id}
                ], function(err) {
                    if (err) throw err;
                    console.log("Successfully updated employee role!");
                    runApp();
                })
            })
    })
}