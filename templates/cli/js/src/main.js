#!/usr/bin/env node
// This is the main application entry point

import { Command } from 'commander';
import process from 'process';
import { appinfo } from './utils/defaults.js';

/**
 * Parses command-line arguments and processes commands.
 */
function ParseAndProcess() {
    const program = new Command();

    program
        .description(
            `The ${appinfo.description}`,
        )
        .version(`\nVersion ${appinfo.version}\n`);

    program
        .command('example', 'example command')

    program.parse(process.argv);
}

ParseAndProcess();