#!/usr/bin/env node
import path from 'path';
import spawn from 'cross-spawn';

const executePath = path.join(__dirname, "../src/index.ts")

spawn('esno', [executePath, ...process.argv.slice(2)], {
    env: process.env,
    stdio: 'inherit'
});