# Trainer State Visualizer

Visualize your training logs. Works with transformers and Trainer out-of-the-box.
https://trainviz.goncharov.page/

<img width="1409" height="814" alt="изображение" src="https://github.com/user-attachments/assets/2b931d8a-ac70-4fbc-9201-a1c3d9b00a50" />

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
