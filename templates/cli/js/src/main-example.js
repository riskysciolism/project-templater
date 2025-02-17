import { program } from 'commander';
import { appinfo, initConfig, logMessage } from './utils/defaults.js';

initConfig();

program.description(`The ${appinfo.description}`);

program
    .command('test <filename...>')
    .option('-t, --test <test>', 'Test option')
    .description('test command')
    .action(test);

program.parse(process.argv);

/**
 * Splits the file name into the base name and the extension.
 *
 * @param {string} fileName - The name of the file to split
 * @returns {Array<string>} An array where the first element is the base name and the second element is the extension
 */
function test(args, options) {
    logMessage('info', args, options);
}
