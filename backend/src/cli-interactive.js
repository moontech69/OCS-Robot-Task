#!/usr/bin/env node

const inquirer = require("inquirer");
const chalk = require("chalk");
const Robot = require("./models/Robot");

const CLEAR_SCREEN = "\x1b[2J";
const CURSOR_HOME = "\x1b[H";

const DIRECTION_SYMBOLS = {
	North: "↑",
	South: "↓",
	East: "→",
	West: "←",
};

// Terrain colors
const TERRAIN_COLORS = {
	Fe: chalk.rgb(139, 69, 19), // Brown for Ferrum
	Se: chalk.yellow, // Yellow for Selenium
	W: chalk.blue, // Blue for Water
	Si: chalk.green, // Green for Silicon
	Zn: chalk.magenta, // Magenta for Zinc
	Obs: chalk.red, // Red for Obstacle
};

let terrain = [
	["Fe", "Fe", "Se"],
	["W", "Si", "Obs"],
];
let robot = null;
let battery = 50;
let initialPosition = {
	location: { x: 0, y: 0 },
	facing: "East",
};

function initializeRobot() {
	robot = new Robot(terrain, battery, initialPosition);
}

function displayTerrain() {
	console.log(CLEAR_SCREEN + CURSOR_HOME);
	console.log(chalk.bold("Mars Robot Interactive CLI\n"));

	console.log(chalk.bold("Terrain:"));

	let border = "┌";
	for (let x = 0; x < terrain[0].length; x++) {
		border += "────┬";
	}
	border = border.slice(0, -1) + "┐";
	console.log(border);

	for (let y = 0; y < terrain.length; y++) {
		let row = "│";
		for (let x = 0; x < terrain[y].length; x++) {
			const cell = terrain[y][x];
			const isRobotHere = robot.position.x === x && robot.position.y === y;
			const isVisited = robot.visitedCells.some(
				(visitedCell) => visitedCell.X === x && visitedCell.Y === y
			);

			let cellDisplay = ` ${cell} `;
			if (isRobotHere) {
				cellDisplay += DIRECTION_SYMBOLS[robot.position.facing];
			} else {
				cellDisplay += " ";
			}

			if (isRobotHere) {
				row += chalk.bgWhite.black(cellDisplay);
			} else if (isVisited) {
				row += chalk.bgGray(TERRAIN_COLORS[cell](cellDisplay));
			} else {
				row += TERRAIN_COLORS[cell](cellDisplay);
			}
			row += "│";
		}
		console.log(row);

		if (y < terrain.length - 1) {
			let separator = "├";
			for (let x = 0; x < terrain[0].length; x++) {
				separator += "────┼";
			}
			separator = separator.slice(0, -1) + "┤";
			console.log(separator);
		}
	}

	let bottomBorder = "└";
	for (let x = 0; x < terrain[0].length; x++) {
		bottomBorder += "────┴";
	}
	bottomBorder = bottomBorder.slice(0, -1) + "┘";
	console.log(bottomBorder);

	console.log("\n" + chalk.bold("Robot Status:"));
	console.log(`Position: (${robot.position.x}, ${robot.position.y})`);
	console.log(
		`Facing: ${robot.position.facing} ${
			DIRECTION_SYMBOLS[robot.position.facing]
		}`
	);
	console.log(`Battery: ${chalk.yellow(robot.battery)} units`);

	if (robot.samplesCollected.length === 0) {
		console.log("None");
	} else {
		robot.samplesCollected.forEach((sample) => {
			console.log(`- ${TERRAIN_COLORS[sample](sample)}`);
		});
	}

	console.log("\n" + chalk.bold("Visited Cells:"));
	robot.visitedCells.forEach((cell) => {
		console.log(`- (${cell.X}, ${cell.Y})`);
	});
}

async function executeCommand(command) {
	const success = robot.executeCommand(command);
	displayTerrain();

	if (!success) {
		console.log(
			chalk.red(
				"\nCommand failed! Not enough battery or all backoff strategies failed."
			)
		);
		await promptContinue();
	}

	return success;
}

async function promptCommand() {
	const { command } = await inquirer.prompt([
		{
			type: "list",
			name: "command",
			message: "Choose a command:",
			choices: [
				{ name: "Move Forward (F) - 3 battery units", value: "F" },
				{ name: "Move Backward (B) - 3 battery units", value: "B" },
				{ name: "Turn Left (L) - 2 battery units", value: "L" },
				{ name: "Turn Right (R) - 2 battery units", value: "R" },
				{ name: "Take Sample (S) - 8 battery units", value: "S" },
				{
					name: "Extend Solar Panels (E) - Recharges 10 battery units",
					value: "E",
				},
				new inquirer.Separator(),
				{ name: "Edit Terrain", value: "EDIT_TERRAIN" },
				{ name: "Reset Robot", value: "RESET" },
				{ name: "Exit", value: "EXIT" },
			],
		},
	]);

	if (command === "EXIT") {
		console.log(
			chalk.green("\nThank you for using Mars Robot Interactive CLI!")
		);
		process.exit(0);
	} else if (command === "RESET") {
		await promptRobotSettings();
	} else if (command === "EDIT_TERRAIN") {
		await promptTerrainSettings();
	} else {
		await executeCommand(command);
		await promptCommand();
	}
}

async function promptContinue() {
	await inquirer.prompt([
		{
			type: "input",
			name: "continue",
			message: "Press Enter to continue...",
		},
	]);
}

async function promptRobotSettings() {
	const answers = await inquirer.prompt([
		{
			type: "number",
			name: "battery",
			message: "Enter initial battery level:",
			default: 50,
			validate: (value) => (value >= 0 ? true : "Battery must be non-negative"),
		},
		{
			type: "number",
			name: "x",
			message: "Enter initial X position:",
			default: 0,
			validate: (value) => {
				if (value < 0 || value >= terrain[0].length) {
					return `X must be between 0 and ${terrain[0].length - 1}`;
				}
				return true;
			},
		},
		{
			type: "number",
			name: "y",
			message: "Enter initial Y position:",
			default: 0,
			validate: (value) => {
				if (value < 0 || value >= terrain.length) {
					return `Y must be between 0 and ${terrain.length - 1}`;
				}
				if (terrain[value][answers.x] === "Obs") {
					return "Initial position cannot be an obstacle";
				}
				return true;
			},
		},
		{
			type: "list",
			name: "facing",
			message: "Choose initial facing direction:",
			choices: ["North", "South", "East", "West"],
			default: "East",
		},
	]);

	battery = answers.battery;
	initialPosition = {
		location: { x: answers.x, y: answers.y },
		facing: answers.facing,
	};

	initializeRobot();
	displayTerrain();
	await promptCommand();
}

async function promptTerrainSettings() {
	const answers = await inquirer.prompt([
		{
			type: "number",
			name: "rows",
			message: "Enter number of rows:",
			default: terrain.length,
			validate: (value) => (value > 0 ? true : "Rows must be positive"),
		},
		{
			type: "number",
			name: "cols",
			message: "Enter number of columns:",
			default: terrain[0].length,
			validate: (value) => (value > 0 ? true : "Columns must be positive"),
		},
	]);

	const newTerrain = [];
	for (let y = 0; y < answers.rows; y++) {
		const row = [];
		for (let x = 0; x < answers.cols; x++) {
			if (y < terrain.length && x < terrain[0].length) {
				row.push(terrain[y][x]);
			} else {
				row.push("Fe"); // Default to Ferrum
			}
		}
		newTerrain.push(row);
	}

	terrain = newTerrain;

	for (let y = 0; y < terrain.length; y++) {
		for (let x = 0; x < terrain[0].length; x++) {
			const { cellType } = await inquirer.prompt([
				{
					type: "list",
					name: "cellType",
					message: `Select terrain type for cell (${x}, ${y}):`,
					choices: ["Fe", "Se", "W", "Si", "Zn", "Obs"],
					default: terrain[y][x],
				},
			]);
			terrain[y][x] = cellType;
		}
	}

	if (
		initialPosition.location.x >= terrain[0].length ||
		initialPosition.location.y >= terrain.length ||
		terrain[initialPosition.location.y][initialPosition.location.x] === "Obs"
	) {
		console.log(
			chalk.yellow(
				"\nInitial position is no longer valid. Resetting robot position."
			)
		);
		await promptRobotSettings();
	} else {
		initializeRobot();
		displayTerrain();
		await promptCommand();
	}
}

async function main() {
	console.log(chalk.bold.green("Welcome to Mars Robot Interactive CLI!"));
	console.log("This tool allows you to control the Mars Robot step by step.\n");

	initializeRobot();
	displayTerrain();
	await promptCommand();
}

main().catch((error) => {
	console.error(chalk.red("An error occurred:"), error);
	process.exit(1);
});
