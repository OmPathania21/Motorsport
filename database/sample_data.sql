USE motorsport_2025;

INSERT INTO Championship (ChampionshipID, ChampionshipName, Year) VALUES
	(1, 'Formula 1 World Championship', 2025),
	(2, 'FIA World Endurance Championship', 2025)
ON DUPLICATE KEY UPDATE
	ChampionshipName = VALUES(ChampionshipName),
	Year = VALUES(Year);

INSERT INTO Team (TeamID, TeamName, Manufacturer, ChampionshipID, CarNumber) VALUES
	('RBR', 'Red Bull Racing', 'Red Bull Powertrains', 1, '1'),
	('FER', 'Scuderia Ferrari', 'Ferrari', 1, '16'),
	('MCL', 'McLaren F1 Team', 'Mercedes', 1, '4'),
	('TOY', 'Toyota Gazoo Racing', 'Toyota', 2, '8')
ON DUPLICATE KEY UPDATE
	TeamName = VALUES(TeamName),
	Manufacturer = VALUES(Manufacturer),
	ChampionshipID = VALUES(ChampionshipID),
	CarNumber = VALUES(CarNumber);

INSERT INTO Driver (DriverID, DriverName, Nationality, TeamID) VALUES
	(1, 'Max Verstappen', 'Dutch', 'RBR'),
	(2, 'Charles Leclerc', 'Monacan', 'FER'),
	(3, 'Lando Norris', 'British', 'MCL'),
	(4, 'Sebastien Buemi', 'Swiss', 'TOY')
ON DUPLICATE KEY UPDATE
	DriverName = VALUES(DriverName),
	Nationality = VALUES(Nationality),
	TeamID = VALUES(TeamID);

INSERT INTO Race (RaceID, RaceName, TrackName, RaceDate, RaceTime, ChampionshipID) VALUES
	(1, 'Australian Grand Prix', 'Albert Park', '2025-03-16', '14:00', 1),
	(2, 'Monaco Grand Prix', 'Circuit de Monaco', '2025-05-25', '15:00', 1),
	(3, '6 Hours of Spa', 'Spa-Francorchamps', '2025-05-10', '13:00', 2)
ON DUPLICATE KEY UPDATE
	RaceName = VALUES(RaceName),
	TrackName = VALUES(TrackName),
	RaceDate = VALUES(RaceDate),
	RaceTime = VALUES(RaceTime),
	ChampionshipID = VALUES(ChampionshipID);

INSERT INTO RaceResult (ResultID, RaceID, TeamID, FinalPosition, Status, LapsCompleted, PointsEarned) VALUES
	(1, 1, 'RBR', '1', 'Finished', 58, 25),
	(2, 1, 'FER', '2', 'Finished', 58, 18),
	(3, 1, 'MCL', '3', 'Finished', 58, 15),
	(4, 2, 'FER', '1', 'Finished', 78, 25),
	(5, 2, 'RBR', 'DNF', 'Engine', 42, 0),
	(6, 3, 'TOY', '1', 'Finished', 182, 38)
ON DUPLICATE KEY UPDATE
	RaceID = VALUES(RaceID),
	TeamID = VALUES(TeamID),
	FinalPosition = VALUES(FinalPosition),
	Status = VALUES(Status),
	LapsCompleted = VALUES(LapsCompleted),
	PointsEarned = VALUES(PointsEarned);
