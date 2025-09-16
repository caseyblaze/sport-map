# Sport Map Project

This project is a web application that utilizes Leaflet.js and OpenStreetMap to create an interactive map displaying locations sourced from an Excel file.

## Project Structure

```
sport-map
├── public
│   ├── index.html          # Main HTML document
│   ├── css
│   │   └── style.css      # CSS styles for the project
│   ├── js
│   │   └── map.js         # JavaScript for initializing the map and processing data
│   └── data
│       └── locations.xls   # Excel file containing location data
├── README.md               # Documentation for the project
└── package.json            # npm configuration file
```

## Setup Instructions

1. **Clone the Repository**: 
   Clone this repository to your local machine using:
   ```
   git clone <repository-url>
   ```

2. **Navigate to the Project Directory**:
   ```
   cd sport-map
   ```

3. **Install Dependencies**:
   Use npm to install the required libraries:
   ```
   npm install xlsx leaflet
   ```

4. **Open the Project**:
   Open `public/index.html` in your web browser to view the map.

## Usage

- The application reads location data from `public/data/locations.xls`.
- Markers are displayed on the map based on the data extracted from the Excel file.
- Customize the appearance of the map and other elements using `public/css/style.css`.

## Deployment

Once you have tested the application and everything is functioning correctly, you can push the project to a Git repository and share the URL for exposure via LINE OA.

## Additional Information

For any issues or contributions, please refer to the project's GitHub page or contact the project maintainer.