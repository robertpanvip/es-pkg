#!/usr/bin/env node
import path from 'path';
import spawn from 'cross-spawn';

const executePath = path.join(process.cwd(), "./src/es-pkg.ts")

spawn('esno', [executePath, ...process.argv.slice(2)], {
    env: process.env,
    stdio: 'inherit'
});