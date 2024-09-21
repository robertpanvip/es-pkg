#!/usr/bin/env node
import program from 'commander'
import pkg from '../package.json'
import {resolveConfig} from '@es-pkg/config';
import execute from '@es-pkg/execute'
import {log} from "@es-pkg/utils";

const help = () => {
    log('  Usage:');
    log('        compile  编译项目');
    log('        iife    iife 打包项目');
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
            execute((await import('@es-pkg/compile')))
        } else if (command === 'iife') {
            execute((await import('@es-pkg/iife')))
        } else if (command === 'publish') {
            execute((await import('@es-pkg/publish')))
        } else if (command === 'doc') {
            execute((await import('./doc')))
        } else {
            log('未知命令', command);
        }
    })
    .parse(process.argv);
