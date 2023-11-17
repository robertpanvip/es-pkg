#!/usr/bin/env node
import program from 'commander'
import pkg from '../package.json'
import {resolveConfig} from './utils/config';
import execute from './utils/execute'
import {log} from "./utils/log";

const help = () => {
    log('  Usage:');
    log('        compile  编译项目');
    log('        unpkg    unpkg 打包项目');
    log('        publish    发布项目');
    log('        doc    根据ts声明生成md');
}
program.on('--help', help);

program
    .version(pkg.version)
    .action(async (options, destination) => {
        if (!destination) {
            help();
            return;
        }
        //先获取config
        await resolveConfig();
        const command = destination[0];
        if (command === 'compile') {
            execute((await import('./run/compile')))
        } else if (command === 'unpkg') {
            execute((await import('./run/unpkg')))
        } else if (command === 'publish') {
            execute((await import('./run/publish')))
        } else if (command === 'doc') {
            execute((await import('./run/doc')))
        } else {
            log('未知命令', command);
        }
    })
    .parse(process.argv);
