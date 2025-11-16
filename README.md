# 🚂 Rodalytics

Automated data collector for Rodalies de Catalunya train incidents.

## What it does

- Fetches RSS feeds from all Rodalies lines every hour
- Parses incident data (title, description, published date)
- Stores unique incidents in a SQLite database
- Runs automatically via GitHub Actions

## Structure

```
rodalytics/
├── collector/
│   ├── src/
│   │   ├── lines.js      # RSS feed URLs for all lines
│   │   ├── fetch.js      # Fetches and parses RSS feeds
│   │   ├── store.js      # Database operations
│   │   └── run.js        # Main collector script
│   ├── data/
│   │   └── rodalytics.db # SQLite database
│   └── package.json
└── .github/workflows/
    └── collector.yml     # Hourly automation
```

## Local Setup

1. **Install dependencies:**

   ```bash
   cd collector
   npm install
   ```

2. **Run the collector:**

   ```bash
   npm start
   ```

3. **Check the database:**
   ```bash
   sqlite3 data/rodalytics.db "SELECT COUNT(*) FROM incidents;"
   ```

## Lines Covered

- R1, R2, R2 Nord, R2 Sud
- R3, R4, R7, R8
- R11, R12, R13, R14, R15, R16, R17

## Database Schema

| Column       | Type    | Description                       |
| ------------ | ------- | --------------------------------- |
| id           | INTEGER | Primary key                       |
| line         | TEXT    | Line name (e.g., "R1")            |
| title        | TEXT    | Incident title                    |
| description  | TEXT    | Incident description              |
| published_at | TEXT    | When the incident was published   |
| detected_at  | TEXT    | When we detected it               |
| hash         | TEXT    | Unique hash to prevent duplicates |

## GitHub Actions

The collector runs automatically every hour. To enable:

1. Push this repository to GitHub
2. The workflow will start running automatically
3. Check the "Actions" tab to see runs

To trigger manually: Go to Actions → Rodalytics Data Collector → Run workflow

## Future Plans

- Web dashboard to visualize incident patterns
- Historical analysis of line reliability
- Real-time notifications for new incidents

## License

MIT
