#!/usr/bin/env node

const path = require('path');
const { promisify } = require('util');
const chalk = require('chalk');
const downloadGitRepo = require('download-git-repo');
const ora = require('ora');
const del = require('del');
const inquirer = require('inquirer');
const program = require('commander');

const getQuestions = require('./getQuestions');
const copy = require('./copy');

const download = promisify(downloadGitRepo);

const { version } = require('../package.json');

program
  .version(version, '-v, --version')
  .command('init')
  .action(async () => {
    const questions = await getQuestions();
    const answers = await inquirer.prompt(questions);

    const downloadFolder = path.join(process.cwd(), '.tmp');
    del.sync([downloadFolder], { force: true });

    const spinner = ora({
      text: '正在下载模板...',
      'spinner': {
        'interval': 80,
        'frames': [
          '🕛',
          '🕐',
          '🕑',
          '🕒',
          '🕓',
          '🕔',
          '🕕',
          '🕖',
          '🕗',
          '🕘',
          '🕙',
          '🕚'
        ]
      },
    }).start();

    try {
      await download('direct:https://github.com/Samaritan89/react-project-demo.git#template', downloadFolder, { clone: true });
      spinner.succeed(chalk.green('模板下载成功！'));
    } catch (ex) {
      spinner.fail(chalk.red('模板下载失败！'));
      console.log(ex);
      return;
    }

    const source = `${downloadFolder}/**/*`;
    const dest = path.join(process.cwd(), answers.name);

    console.log(chalk.grey('\n复制文件到本地'));
    await copy(source, dest, answers);
    del.sync([downloadFolder], { force: true });

    console.log(chalk.greenBright(`\n项目创建成功! ${chalk.bold(dest)}`));
  });

program.parse(process.argv);
