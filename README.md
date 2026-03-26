# Sport Map Project

DEMO: https://caseyblaze.github.io/sport-map/

This is an interactive map site built with Leaflet.js and OpenStreetMap. Data comes from a CSV file.

## Structure

```
sport-map
├── docs
│   ├── index.html       
│   ├── css
│   │   └── style.css     
│   ├── js
│   │   └── map.js    
│   └── data
├── README.md           
└── package.json  
```

## Local Development

This is a static site and does not require a build step. Use a local static server to avoid CORS issues when loading the CSV.

1. **Clone the repository**
   ```
   git clone <repository-url>
   ```

2. **Enter the project directory**
   ```
   cd sport-map
   ```

3. **Start a local server**
   ```
   # Node (requires npx)
   npx serve docs
   ```

4. **Open the site**
   - npx serve: use the URL printed in the terminal


## Notes

- Static assets and map icons live in [docs](docs).
- Map data is in [docs/data/taiwan_locations.csv](docs/data/taiwan_locations.csv).