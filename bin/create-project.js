#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.resolve(__dirname, '../templates');
const availableTemplates = fs.readdirSync(templatesDir).reduce((acc, template) => {
  const templatePath = path.join(templatesDir, template);
  if (fs.statSync(templatePath).isDirectory()) {
    const languages = fs.readdirSync(templatePath).filter(language => fs.statSync(path.join(templatePath, language)).isDirectory());
    acc[template] = languages;
  }
  return acc;
}, {});

async function main() {
  console.info('🚀 Welcome to the CLI Project Generator!');

  const templateChoices = Object.keys(availableTemplates).map(template => {
    const descriptionPath = path.join(templatesDir, template, 'template.json');
    const description = fs.existsSync(descriptionPath) ? fs.readJsonSync(descriptionPath).description : 'No description available';
    return {
      name: `${template} - ${description}`,
      value: template
    };
  });

  const { templateType } = await inquirer.prompt([
    {
      choices: templateChoices,
      message: '📂 Select a template type:',
      name: 'templateType',
      type: 'list',
    }
  ]);

  // Falls es mehrere Sprachen gibt, nach JS/TS fragen
  let language = 'js';
  if (availableTemplates[templateType].length > 1) {
    const { selectedLanguage } = await inquirer.prompt([
      {
        choices: availableTemplates[templateType],
        message: '📜 Select a language:',
        name: 'selectedLanguage',
        type: 'list',
      }
    ]);
    language = selectedLanguage;
  } else {
    language = availableTemplates[templateType][0]; // Falls nur eine Sprache existiert
  }


  // Fragen für den Benutzer
  const answers = await inquirer.prompt([
    {
      message: '📂 Enter project name:',
      name: 'projectName',
      type: 'input',
      validate: (input) => {
        if (!input) return 'Project name cannot be empty!';
        if (!/^[a-z0-9-_]+$/.test(input)) return 'Project name must consist of lowercase letters, numbers, hyphens, and underscores only!';

        return true;
      },
    },
    {
      message: '👤 Enter author name:',
      name: 'author',
      type: 'input',
      validate: (input) => {
        if (!input) return 'Author name cannot be empty!';
        return true;
      },
    }, {
      message: '👤 Enter npm user:',
      name: 'npmUser',
      type: 'input',
    },
    {
      default: '1.0.0',
      message: '🔖 Enter initial version:',
      name: 'version',
      type: 'input',
    },
    {
      default: 'js',
      message: '🔧 Do you want to install dependencies?',
      name: 'installDeps',
      type: 'confirm',
    },
    {
      default: true,
      message: '🔧 Do you want to install dependencies?',
      name: 'installDeps',
      type: 'confirm',
    },
  ]);

  const targetDir = path.resolve(process.cwd(), answers.projectName);
  const selectedTemplatePath = path.join(templatesDir, templateType, language);

  console.info(`\n📦 Creating project from template: ${templateType}/${language} in ${targetDir}...`);

  if (fs.existsSync(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        default: false,
        message: `⚠️ Directory ${answers.projectName} already exists. Do you want to overwrite it?`,
        name: 'overwrite',
        type: 'confirm',
      }
    ]);

    if (overwrite) {
      fs.removeSync(targetDir);
      console.info(`🗑️ Deleted existing directory: ${targetDir}`);
    } else {
      console.info('❌ Project creation aborted.');
      process.exit(1);
    }
  }

  // Copy Template-Files
  fs.copySync(selectedTemplatePath, targetDir);

  // Generate 'package.json'
  const packageJsonPath = path.join(targetDir, 'package.json');
  const packageJson = fs.readJsonSync(packageJsonPath);

  packageJson.name = answers.npmUser ? `@${answers.npmUser}/${answers.projectName}` : answers.projectName;
  packageJson.version = answers.version;
  packageJson.author = answers.author;

  const replaceAppName = (obj, projectName) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object')
        replaceAppName(obj[key], projectName);
      else if (typeof obj[key] === 'string')
        obj[key] = obj[key].replace(/<appName>/g, projectName);

      if (key.includes('<appName>')) {
        const newKey = key.replace(/<appName>/g, projectName);
        obj[newKey] = obj[key];
        delete obj[key];
      }
    }
  };

  replaceAppName(packageJson, answers.projectName);

  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: '\t' });
  try {
    execSync('git init', { cwd: targetDir, stdio: 'inherit' });
    console.info('✅ Git repository initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing git:', error.message);
    process.exit(1);
  }

  if (answers.installDeps)
    try {
      execSync('npx npm-check-updates -u --silent', { cwd: targetDir, stdio: 'inherit' });
      execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
      console.info('✅ Dependencies installed successfully!\n');
    } catch (error) {
      console.error('❌ Error installing dependencies:', error.message);
    }

  console.info('🎉 Project setup complete! Run the following to start:\n');
  console.info(`cd ${answers.projectName}`);
  console.info('node .\\src\\main.js');
}

main();
