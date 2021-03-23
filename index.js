const yaml = require("js-yaml");
const fs = require("fs");
const childProcess = require("child_process");
const { exit, argv } = require("process");

const topLevelNode = yaml.load(fs.readFileSync("./talc.yaml", "utf8"));

let args = process.argv;
if (args[0].endsWith('/node')) {
    args = args.slice(2);
} else {
    args = args.slice(1);
}

let curNode = topLevelNode;

function helpString(node) {
    return "Available commands are:\n" + Object.values(node.commands).map((value) => `  ${value.name}: ${value.doc}`).join('\n');
}

while (!curNode.shell) {
    const curCommand = args.shift();
    if (!curCommand) {
        console.log(helpString(curNode));
        exit(0);
    }

    const next = curNode.commands.find(cmd => cmd.name === curCommand);
    if (!next) {
        const errMsg = `Invalid subcommand ${curCommand}\n${helpString(curNode)}`;
        console.error(errMsg);
        exit(1);
    }
    curNode = next;
}

const child = childProcess.exec(curNode.shell + args.join(" "));

child.stdout.on('data', (data) => {
    process.stdout.write(data);
});

child.on('exit', (code) => {
    exit(code);
});;