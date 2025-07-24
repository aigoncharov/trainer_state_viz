# Trainer State Visualizer

This is a React-based application for visualizing training logs from JSON files without requiring a server backend.

## Installation

```bash
npm install
```

## Running the App

```bash
npm start
```

This will start a development server via Parcel and open the app in your default browser.

## Features

- Upload JSON files containing a `log_history` array of objects with `epoch` or `step` fields.
- Automatically detect and switch between `epoch` and `step` as the x-axis.
- Select which metrics to display via a fields multiselect (default shows all `*_accuracy` fields).
- Render customizable line charts using Recharts.

## Usage

1. Click the **Upload JSON** button and select a JSON file.
2. Use the **X Axis** dropdown to switch between `epoch` and `step`.
3. Check or uncheck metrics in the **Fields** list to customize displayed lines.

## Development

- The app is bundled with Parcel.
- The entry point is `src/index.html` and `src/index.jsx`.
- Main component logic resides in `src/App.jsx`.

## License

MIT