const fs = require('fs');
const path = require('path');

const inquirer = require("inquirer");
const rimraf = require('rimraf');
const checksum = require('checksum');
const readAll = require("recursive-readdir");
const download = require('download');

const exec = require('child_process').exec;
const tempPath = path.join(__dirname, 'temp');

const questions = [
  {
    type: "input",
    name: "url",
    message: "Whats the download url?"
  },
  {
    type: "input",
    name: "file",
    message: "Whats the file name?"
  },
  {
    type: "input",
    name: "pattern",
    message: "pattern to exclude(leave blank for none)"
  }
];

inquirer.prompt(questions).then(answers => {
	const {file, url} = answers;
	if(!url || url == '') {
		console.log('no url specified');
		return;
	}
	if(!file || file == '') {
		console.log('no file specified');
		return;
	}
  go(answers);
});

async function go(answers) {
	rimraf(tempPath, async ()=> {
		await download(answers.url, 'temp');
		readFiles(answers);
	})
}

function readFiles(answers) {
	let filePath = '';
	fs.readdir(tempPath, function(err, items) {
		if(items[0] && items[0] !== '' && items[0].includes('.zip')) {
			exec(`unzip ${path.join(tempPath,items[0])} -d ${tempPath}`, () => {
				getThemAll(answers);
			})
		} else {
			getThemAll(answers);
		}
	});
}

function getThemAll(answers) {
	readAll(tempPath, (err, entries) => {
		entries.forEach((entryName) => {
			if(
				entryName.endsWith(answers.file) &&
				!entryName.includes('test') &&
				!entryName.includes('unit') &&
				!(
					answers.pattern &&
					entryName.includes(answers.pattern)
				)
			) {
				getHash(entryName);
			}
		})
	});
}

function getHash(filePath) {
  	checksum.file(filePath, {algorithm: 'sha256'}, (err, h) => console.log(filePath, h))
}