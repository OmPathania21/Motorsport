from flask import Flask, jsonify, send_from_directory
from mysql.connector import Error
from pathlib import Path

from db import get_db

app = Flask(__name__, static_folder="../frontend", static_url_path="")
MEDIA_FOLDER = (Path(__file__).resolve().parent.parent / "Media").resolve()


def run_query(query, params=()):
    """Run a read-only query and return (rows, error)."""
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute(query, params)
        return cursor.fetchall(), None
    except Error as exc:
        return None, str(exc)
    finally:
        if cursor:
            cursor.close()
        if db and db.is_connected():
            db.close()


def run_procedure(procedure_name, params=()):
    """Run a stored procedure and return (rows, error)."""
    db = None
    cursor = None
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        placeholders = ", ".join(["%s"] * len(params))
        if placeholders:
            call_sql = f"CALL {procedure_name}({placeholders})"
        else:
            call_sql = f"CALL {procedure_name}()"

        cursor.execute(call_sql, params)

        rows = cursor.fetchall() if cursor.with_rows else []
        while cursor.nextset():
            if cursor.with_rows:
                rows = cursor.fetchall()

        return rows, None
    except Error as exc:
        return None, str(exc)
    finally:
        if cursor:
            cursor.close()
        if db and db.is_connected():
            db.close()


def workbench_object_error(entity):
    return (
        "Unable to fetch "
        f"{entity}: required Workbench routines are missing. "
        "Run database/workbench_api_objects.sql in MySQL Workbench and restart the backend."
    )


def error_response(message, status_code=500):
    return jsonify({"error": message}), status_code


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    return response


@app.route("/")
def home():
    return send_from_directory(app.static_folder, "intro-experience.html")


@app.route("/championship")
def championship_page():
    return send_from_directory(app.static_folder, "championship.html")


@app.route("/data")
def data_page():
    return send_from_directory(app.static_folder, "data.html")


@app.route("/race-data")
def race_data_page():
    return send_from_directory(app.static_folder, "race-data.html")


@app.route("/team-data")
def team_data_page():
    return send_from_directory(app.static_folder, "team-data.html")


@app.route("/driver-data")
def driver_data_page():
    return send_from_directory(app.static_folder, "driver-data.html")


@app.route("/result-data")
def result_data_page():
    return send_from_directory(app.static_folder, "result-data.html")


@app.route("/Media/<path:filename>")
def media(filename):
    return send_from_directory(MEDIA_FOLDER, filename)


@app.route("/health")
def health():
    rows, err = run_query("SELECT 1 AS ok")
    if err:
        return error_response(f"Database connection failed: {err}")
    return jsonify({"ok": True, "db": rows[0]["ok"] == 1})


@app.route("/api/championships")
@app.route("/championships")
def get_championships():
    rows, err = run_procedure("WB_GetChampionships")
    if err:
        return error_response(f"{workbench_object_error('championships')} ({err})")
    return jsonify(rows)


@app.route("/api/championships/<int:championship_id>")
def get_championship(championship_id):
    rows, err = run_procedure("WB_GetChampionship", (championship_id,))
    if err:
        return error_response(f"{workbench_object_error('championship')} ({err})")
    if not rows:
        return error_response("Championship not found", 404)
    return jsonify(rows[0])


@app.route("/api/championships/<int:championship_id>/teams")
@app.route("/teams/<championship_id>")
def get_teams(championship_id):
    rows, err = run_procedure("WB_GetTeamsByChampionship", (championship_id,))
    if err:
        return error_response(f"{workbench_object_error('teams')} ({err})")
    return jsonify(rows)


@app.route("/api/championships/<int:championship_id>/drivers")
def get_drivers_by_championship(championship_id):
    rows, err = run_procedure("WB_GetDriversByChampionship", (championship_id,))
    if err:
        return error_response(f"{workbench_object_error('drivers')} ({err})")
    return jsonify(rows)


@app.route("/drivers/<team_id>")
def get_drivers(team_id):
    rows, err = run_procedure("WB_GetDriversByTeam", (team_id,))
    if err:
        return error_response(f"{workbench_object_error('team drivers')} ({err})")
    return jsonify(rows)


@app.route("/api/championships/<int:championship_id>/races")
@app.route("/race/<championship_id>")
def get_race(championship_id):
    rows, err = run_procedure("WB_GetRacesByChampionship", (championship_id,))
    if err:
        return error_response(f"{workbench_object_error('races')} ({err})")
    return jsonify(rows)


@app.route("/api/championships/<int:championship_id>/results")
def get_results_by_championship(championship_id):
    rows, err = run_procedure("WB_GetResultsByChampionship", (championship_id,))
    if err:
        return error_response(f"{workbench_object_error('championship results')} ({err})")
    return jsonify(rows)


@app.route("/api/races/<int:race_id>/results")
@app.route("/results/<race_id>")
def get_results(race_id):
    rows, err = run_procedure("WB_GetResultsByRace", (race_id,))
    if err:
        return error_response(f"{workbench_object_error('race results')} ({err})")
    return jsonify(rows)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)