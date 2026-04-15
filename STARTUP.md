# Motorsport – Quick Start Guide

A cinematic Formula 1 experience with interactive data visualization powered by MySQL and Flask.

## Project Structure

```
Motorsport/
├── backend/           # Flask server + APIs
│   ├── app.py        # Main Flask app (port 5001)
│   ├── db.py         # MySQL database connection
│   ├── requirements.txt
│   ├── venv/         # Python virtual environment
│   └── routes/       # API endpoints
├── frontend/         # HTML/CSS/JS (served by Flask)
│   ├── *.html        # Page templates
│   ├── css/          # Stylesheets
│   └── js/           # Page scripts
├── database/         # SQL schemas & data
└── Media/            # Video & image assets
```

## Prerequisites

- **Python 3.8+** – verify with `python3 --version`
- **MySQL Server** – running locally or via Docker
- **Virtual environment** – already in `backend/venv/`

## How to Start the Project

### Step 1: Navigate to Project Root

```bash
cd /Users/ompathania/Desktop/Motorsport
```

### Step 2: Activate Python Virtual Environment

```bash
source backend/venv/bin/activate
```

You should see `(venv)` prefix in your terminal after this.

### Step 3: Install Dependencies (First Time Only)

```bash
pip install -r backend/requirements.txt
```

### Step 4: Configure MySQL Connection

Edit `backend/db.py` and update these lines with your MySQL credentials:

```python
host = "localhost"          # or your MySQL host
user = "root"               # your MySQL user
password = "your_password"  # your MySQL password
database = "motorsport"     # database name
```

Make sure your MySQL server is running and the `motorsport` database exists.

### Step 5: Start the Flask Backend

```bash
cd backend
python app.py
```

You should see output like:
```
 * Running on http://0.0.0.0:5001
 * Debug mode: on
```

### Step 6: Open in Browser

Open your web browser and go to:

```
http://localhost:5001
```

You'll see the **Intro Experience** page with a "LET'S ROLL" button. Click it to start exploring!

## Navigation Flow

1. **Intro Page** → Click "LET'S ROLL"
2. **Championship Page** → Select a championship
3. **Data Hub** → Choose Race, Team, Driver, or Result sections
4. **Detail Pages** → View SQL-backed tables
5. **Background Toggle** → Click "bg" button to hide content and see full-screen video

## Stopping the Server

Press **Ctrl+C** in the terminal running the Flask server.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5001 already in use | Run `lsof -i :5001` to find process, or use different port in `backend/app.py` |
| MySQL connection fails | Check credentials in `backend/db.py`, ensure MySQL is running |
| Database error | Load `database/schema.sql` into MySQL, check that tables exist |
| Videos not playing | Ensure `/Media` folder exists with video files (bg.mp4, driverTable.mp4, etc.) |
| Pages blank/not loading | Clear browser cache, restart backend, verify venv is activated |

## File Key Locations

- **Backend entry point:** `backend/app.py`
- **API routes:** `backend/routes/`
- **Frontend pages:** `frontend/*.html`
- **Styles:** `frontend/css/*.css`
- **Scripts:** `frontend/js/*.js`
- **Database schema:** `database/schema.sql`
- **Media files:** `/Media/` (at project root)
