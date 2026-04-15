CREATE DATABASE IF NOT EXISTS motorsport_2025;
USE motorsport_2025;

CREATE TABLE IF NOT EXISTS Championship (
	ChampionshipID INT PRIMARY KEY,
	ChampionshipName VARCHAR(100) NOT NULL,
	Year INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Team (
	TeamID VARCHAR(10) PRIMARY KEY,
	TeamName VARCHAR(100) NOT NULL,
	Manufacturer VARCHAR(100) NOT NULL,
	ChampionshipID INT NOT NULL,
	CarNumber VARCHAR(10) NOT NULL,
	CONSTRAINT fk_team_championship
		FOREIGN KEY (ChampionshipID) REFERENCES Championship (ChampionshipID)
		ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Driver (
	DriverID INT PRIMARY KEY AUTO_INCREMENT,
	DriverName VARCHAR(100) NOT NULL,
	Nationality VARCHAR(50) NOT NULL,
	TeamID VARCHAR(10) NOT NULL,
	CONSTRAINT fk_driver_team
		FOREIGN KEY (TeamID) REFERENCES Team (TeamID)
		ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Race (
	RaceID INT PRIMARY KEY AUTO_INCREMENT,
	RaceName VARCHAR(150) NOT NULL,
	TrackName VARCHAR(100) NOT NULL,
	RaceDate DATE NOT NULL,
	RaceTime VARCHAR(20) NOT NULL,
	ChampionshipID INT NOT NULL,
	CONSTRAINT fk_race_championship
		FOREIGN KEY (ChampionshipID) REFERENCES Championship (ChampionshipID)
		ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS RaceResult (
	ResultID INT PRIMARY KEY AUTO_INCREMENT,
	RaceID INT NOT NULL,
	TeamID VARCHAR(10) NOT NULL,
	FinalPosition VARCHAR(10) NOT NULL,
	Status VARCHAR(50) NOT NULL,
	LapsCompleted INT NOT NULL,
	PointsEarned INT NOT NULL,
	CONSTRAINT fk_result_race
		FOREIGN KEY (RaceID) REFERENCES Race (RaceID)
		ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_result_team
		FOREIGN KEY (TeamID) REFERENCES Team (TeamID)
		ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS LogTable (
	message VARCHAR(100)
);

CREATE INDEX idx_team_championship ON Team (ChampionshipID);
CREATE INDEX idx_driver_team ON Driver (TeamID);
CREATE INDEX idx_race_championship ON Race (ChampionshipID);
CREATE INDEX idx_result_race ON RaceResult (RaceID);
CREATE INDEX idx_result_team ON RaceResult (TeamID);

CREATE OR REPLACE VIEW driverperformance AS
SELECT
	d.DriverID,
	d.DriverName,
	d.Nationality,
	d.TeamID,
	t.TeamName,
	t.ChampionshipID
FROM Driver d
INNER JOIN Team t ON t.TeamID = d.TeamID;

CREATE OR REPLACE VIEW racesummary AS
SELECT
	r.RaceID,
	r.RaceName,
	r.TrackName,
	r.RaceDate,
	rr.ResultID,
	rr.TeamID,
	rr.FinalPosition,
	rr.Status,
	rr.PointsEarned
FROM Race r
LEFT JOIN RaceResult rr ON rr.RaceID = r.RaceID;
