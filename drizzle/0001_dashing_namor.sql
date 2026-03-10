CREATE TABLE `game_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerName` varchar(255) NOT NULL,
	`playerEmail` varchar(320) NOT NULL,
	`investorScore` int NOT NULL DEFAULT 0,
	`esgScore` int NOT NULL DEFAULT 0,
	`finalOutcome` varchar(64) NOT NULL DEFAULT '',
	`archetypeLabel` varchar(128) NOT NULL DEFAULT '',
	`decisions` json NOT NULL DEFAULT ('[]'),
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`durationSeconds` int DEFAULT 0,
	`gameOver` int NOT NULL DEFAULT 0,
	CONSTRAINT `game_sessions_id` PRIMARY KEY(`id`)
);
