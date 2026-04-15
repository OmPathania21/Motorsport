USE motorsport_2025;

CREATE OR REPLACE VIEW wb_championships AS
SELECT ChampionshipID, ChampionshipName, Year
FROM Championship;

CREATE OR REPLACE VIEW wb_teams AS
SELECT TeamID, TeamName, Manufacturer, ChampionshipID, CarNumber
FROM Team;

CREATE OR REPLACE VIEW wb_drivers AS
SELECT DriverID, DriverName, Nationality, TeamID
FROM Driver;

CREATE OR REPLACE VIEW wb_races AS
SELECT RaceID, RaceName, TrackName, RaceDate, RaceTime, ChampionshipID
FROM Race;

CREATE OR REPLACE VIEW wb_race_results AS
SELECT
    rr.ResultID,
    rr.RaceID,
    r.RaceName,
    rr.TeamID,
    t.TeamName,
    rr.FinalPosition,
    rr.Status,
    rr.LapsCompleted,
    rr.PointsEarned,
    r.ChampionshipID,
    r.RaceDate
FROM RaceResult rr
INNER JOIN Race r ON r.RaceID = rr.RaceID
LEFT JOIN Team t ON t.TeamID = rr.TeamID;

DROP PROCEDURE IF EXISTS WB_GetChampionships;
DROP PROCEDURE IF EXISTS WB_GetChampionship;
DROP PROCEDURE IF EXISTS WB_GetTeamsByChampionship;
DROP PROCEDURE IF EXISTS WB_GetDriversByChampionship;
DROP PROCEDURE IF EXISTS WB_GetDriversByTeam;
DROP PROCEDURE IF EXISTS WB_GetRacesByChampionship;
DROP PROCEDURE IF EXISTS WB_GetResultsByChampionship;
DROP PROCEDURE IF EXISTS WB_GetResultsByRace;

DELIMITER $$

CREATE PROCEDURE WB_GetChampionships()
BEGIN
    SELECT ChampionshipID, ChampionshipName, Year
    FROM wb_championships
    ORDER BY Year DESC, ChampionshipName ASC;
END $$

CREATE PROCEDURE WB_GetChampionship(IN p_championship_id INT)
BEGIN
    SELECT ChampionshipID, ChampionshipName, Year
    FROM wb_championships
    WHERE ChampionshipID = p_championship_id;
END $$

CREATE PROCEDURE WB_GetTeamsByChampionship(IN p_championship_id INT)
BEGIN
    SELECT TeamID, TeamName, Manufacturer, ChampionshipID, CarNumber
    FROM wb_teams
    WHERE ChampionshipID = p_championship_id
    ORDER BY TeamName ASC;
END $$

CREATE PROCEDURE WB_GetDriversByChampionship(IN p_championship_id INT)
BEGIN
    SELECT
        d.DriverID,
        d.DriverName,
        d.Nationality,
        d.TeamID,
        t.TeamName
    FROM wb_drivers d
    INNER JOIN wb_teams t ON t.TeamID = d.TeamID
    WHERE t.ChampionshipID = p_championship_id
    ORDER BY t.TeamName ASC, d.DriverName ASC;
END $$

CREATE PROCEDURE WB_GetDriversByTeam(IN p_team_id VARCHAR(10))
BEGIN
    SELECT DriverID, DriverName, Nationality, TeamID
    FROM wb_drivers
    WHERE TeamID = p_team_id
    ORDER BY DriverName ASC;
END $$

CREATE PROCEDURE WB_GetRacesByChampionship(IN p_championship_id INT)
BEGIN
    SELECT RaceID, RaceName, TrackName, RaceDate, RaceTime, ChampionshipID
    FROM wb_races
    WHERE ChampionshipID = p_championship_id
    ORDER BY RaceDate ASC, RaceName ASC;
END $$

CREATE PROCEDURE WB_GetResultsByChampionship(IN p_championship_id INT)
BEGIN
    SELECT
        ResultID,
        RaceID,
        RaceName,
        TeamID,
        TeamName,
        FinalPosition,
        Status,
        LapsCompleted,
        PointsEarned
    FROM wb_race_results
    WHERE ChampionshipID = p_championship_id
    ORDER BY
        RaceDate ASC,
        CASE WHEN FinalPosition REGEXP '^[0-9]+$' THEN 0 ELSE 1 END,
        CAST(FinalPosition AS UNSIGNED),
        FinalPosition;
END $$

CREATE PROCEDURE WB_GetResultsByRace(IN p_race_id INT)
BEGIN
    SELECT
        ResultID,
        RaceID,
        RaceName,
        TeamID,
        TeamName,
        FinalPosition,
        Status,
        LapsCompleted,
        PointsEarned
    FROM wb_race_results
    WHERE RaceID = p_race_id
    ORDER BY
        CASE WHEN FinalPosition REGEXP '^[0-9]+$' THEN 0 ELSE 1 END,
        CAST(FinalPosition AS UNSIGNED),
        FinalPosition;
END $$

DELIMITER ;
