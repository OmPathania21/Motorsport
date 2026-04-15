# Motorsport

A cinematic Formula 1 data experience with interactive pages, SQL-backed tables, and cinematic video transitions.

## Quick Start

1. **Activate virtual environment:**
   ```bash
   cd /Users/ompathania/Desktop/Motorsport
   source backend/venv/bin/activate
   ```

2. **Configure MySQL** in `backend/db.py` with your credentials

3. **Start the backend:**
   ```bash
   cd backend
   python app.py
   ```

4. **Open browser:**
   ```
   http://localhost:5001
   ```

For detailed setup instructions, see [STARTUP.md](STARTUP.md).

## Features

- **Cinematic intro experience** with scroll-driven animations
- **Dynamic championship selection** backed by SQL data
- **Multi-page data hub** with Race, Team, Driver, and Result sections
- **Detailed tables** with real-time SQL queries
- **Background video toggle** to view full-screen media
- **Smooth page transitions** with visual effects
- **Responsive design** for desktop and mobile

## Tech Stack

- **Backend:** Flask (Python)
- **Database:** MySQL with stored procedures and views
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Media:** Video backgrounds (MP4) and images