const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const spawn = require("cross-spawn");
const prompts = require("prompts");
const { hideBin } = require("yargs/helpers");
const { blue, red, green, yellow, reset } = require("kolorist");

const TEMPLATES = [
  {
    name: "template-webpack",
    display: "template-webpack",
    color: green,
  },
];

const PKGMANAGER = [
  { name: "pnpm", color: green },
  { name: "yarn", color: blue },
  { name: "npm", color: red },
  { name: "cnpm", color: yellow },
];

yargs(hideBin(process.argv))
  .command("$0", "init a project", async (yargs) => {
    const { help } = yargs.argv;
    if (help) return;
    const defaultProjectName = "build-template";
    let targetDir = defaultProjectName;
    let template = TEMPLATES[0];
    let package = PKGMANAGER[0];

    await prompts([
      {
        type: "text",
        name: "projectDir",
        initial: defaultProjectName,
        message: "Project folder",
        onState: (state) => {
          targetDir = state.value || defaultProjectName;
        },
      },
    ]);

    const root = path.resolve(process.cwd(), targetDir);

    await prompts([
      {
        type: "select",
        name: "template",
        initial: 0,
        message: reset("选择一个构建工具模板:"),
        choices: TEMPLATES.map((template) => {
          const color = template.color;
          return {
            title: color(template.display || template.name),
            value: template,
          };
        }),
        onState: (state) => {
          template = state.value;
        },
      },
    ]);

    await prompts([
      {
        type: "select",
        name: "package manager",
        initial: 0,
        message: reset("选择一个包管理工具:"),
        choices: PKGMANAGER.map((package) => {
          const color = package.color;
          return {
            title: color(package.name),
            value: package,
          };
        }),
        onState: (state) => {
          package = state.value;
        },
      },
    ]);

    // 创建文件夹
    fs.mkdirSync(root, { recursive: true });
    // 确定模板文件夹地址
    const templateFilePath = path.resolve(__dirname, template.name);
    // 将模板文件夹复制到目标文件夹
    copyFolder(templateFilePath, targetDir);
    // 创建新进程用于执行 package install
    // spawn 用于跨平台执行命令、child_process 使用子进程执行命令
    const { status } = spawn.sync(package.name, ["install"], {
      cwd: targetDir,
      stdio: "inherit",
    });
    process.exit(status ?? 0);
  })
  .help()
  .parse();

function copyFolder(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    const srcFile = path.resolve(src, file);
    const dstFile = path.resolve(dst, file);
    const stat = fs.statSync(srcFile);
    if (stat.isDirectory()) {
      copyFolder(srcFile, dstFile);
    } else {
      fs.copyFileSync(srcFile, dstFile);
    }
  }
}
