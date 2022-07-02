import chalk from 'chalk';// 改变屏幕文字颜色
export const log = (content: string,...rest: any[]) => console.log(chalk.green(content),...rest);
export const info = (content: string,...rest: any[]) => console.log(chalk.magenta(content),...rest);
export const error = (content: string,...rest: any[]) => console.log(chalk.red(content),...rest);
export default{
    log,
    info,
    error,
    debug:log,
}