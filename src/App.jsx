import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { JsonView } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { toBlob, toPng, toJpeg } from 'html-to-image';

export default function App() {
  const [logHistory, setLogHistory] = useState(null);
  const [error, setError] = useState('');
  const [xKey, setXKey] = useState('epoch');
  const [availableFields, setAvailableFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [rawJson, setRawJson] = useState(null);
  const chartRef = React.useRef(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Define a stable color palette
  const colorPalette = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#413ea0',
    '#ff0000', '#00ff00', '#0000ff', '#ffa500', '#800080',
    '#008080', '#dc143c', '#20b2aa', '#ff00ff', '#808000', '#00ced1'
  ];

  // Handle file upload
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        if (!Array.isArray(json.log_history)) {
          throw new Error('log_history must be an array');
        }
        // Validate each entry has epoch or step
        const hasValid = json.log_history.every(entry => typeof entry.epoch === 'number' || typeof entry.step === 'number');
        if (!hasValid) {
          throw new Error('Each log_history entry must have numeric epoch or step');
        }
        setLogHistory(json.log_history);
        setRawJson(json);
        setError('');
      } catch (err) {
        setError(err.message);
        setLogHistory(null);
        setRawJson(null);
      }
    };
    reader.readAsText(file);
  }
  
  // Reset all state to initial
  function handleReset() {
    setLogHistory(null);
    setRawJson(null);
    setError('');
    setXKey('epoch');
    setAvailableFields([]);
    setSelectedFields([]);
    setProcessedData([]);
  }

  // Set available and default selected fields when logHistory loads
  useEffect(() => {
    if (!logHistory) return;
    const keys = new Set();
    logHistory.forEach(entry => Object.keys(entry).forEach(k => { if (k !== 'epoch' && k !== 'step') keys.add(k); }));
    const allFields = Array.from(keys);
    setAvailableFields(allFields);
    // default selected: fields with _accuracy
    const defaultSel = allFields.filter(f => f.endsWith('_accuracy'));
    setSelectedFields(defaultSel);
    // decide xKey default: if epoch missing or all zeros
    const hasEpoch = logHistory.some(e => typeof e.epoch === 'number');
    const allZero = logHistory.every(e => e.epoch === 0);
    if (!hasEpoch || allZero) setXKey('step');
    else setXKey('epoch');
  }, [logHistory]);

  // Process data for chart
  useEffect(() => {
    if (!logHistory) return;
    const dataMap = {};
    logHistory.forEach(entry => {
      const xVal = entry[xKey];
      if (xVal == null) return;
      if (!dataMap[xVal]) dataMap[xVal] = { [xKey]: xVal };
      selectedFields.forEach(f => {
        if (entry[f] != null) dataMap[xVal][f] = entry[f];
      });
    });
    const arr = Object.values(dataMap).sort((a, b) => a[xKey] - b[xKey]);
    setProcessedData(arr);
  }, [logHistory, xKey, selectedFields]);

  // Function to copy chart as image
  async function copyChartImage() {
    if (!chartRef.current) return;
    try {
      const blob = await toBlob(chartRef.current, { pixelRatio: 2 });
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setSnackbar({ open: true, message: 'Chart copied to clipboard', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to copy chart', severity: 'error' });
    }
  }
  
  // Function to export chart image to file
  async function exportChartImage() {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toJpeg(chartRef.current, { quality: 0.95, backgroundColor: '#fff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'chart.jpg';
      link.click();
      setSnackbar({ open: true, message: 'Chart exported as JPG', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to export chart', severity: 'error' });
    }
  }

  if (!logHistory) {
    return (
      <div style={{ padding: 20, position: 'relative' }}>
        <Button variant="outlined" size="small" onClick={handleReset} style={{ position: 'absolute', top: 16, right: 16 }}>
          Reset
        </Button>
        <h1>Trainer State Visualizer</h1>
        <p>Upload your `trainer_state.json` (provided by `Trainer`` from `transformers`) and interactively visualize metrics over epochs or steps.</p>
        <h2>Upload JSON</h2>
        <input type="file" accept="application/json" onChange={handleFile} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <footer style={{ marginTop: 40, textAlign: 'center', color: '#777' }}>
          <a
            href="https://github.com/aigoncharov/trainer_state_viz"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </footer>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <Button variant="outlined" size="small" onClick={copyChartImage}>
          Copy
        </Button>
        <Button variant="outlined" size="small" onClick={exportChartImage}>
          Export
        </Button>
        <Button variant="outlined" size="small" onClick={handleReset}>
          Reset
        </Button>
      </div>
      <h2>Chart</h2>
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {selectedFields.map((f, idx) => (
              <Line
                key={f}
                type="monotone"
                dataKey={f}
                name={f}
                stroke={colorPalette[idx % colorPalette.length]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <h2>Graph Settings</h2>
      <div style={{ marginTop: 10, width: 200 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="x-axis-label">X Axis</InputLabel>
          <Select
            labelId="x-axis-label"
            label="X Axis"
            value={xKey}
            onChange={e => setXKey(e.target.value)}
          >
            <MenuItem value="epoch">Epoch</MenuItem>
            <MenuItem value="step">Step</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div style={{ marginTop: 10, width: '100%', maxWidth: 400 }}>
        <Autocomplete
          multiple
          options={availableFields}
          value={selectedFields}
          onChange={(event, newValue) => setSelectedFields(newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option}
                {...getTagProps({ index })}
                key={option}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Fields"
              placeholder="Select fields"
            />
          )}
        />
      </div>
      <div style={{ marginTop: 20 }}>
        <h2>Uploaded JSON</h2>
        <div style={{ fontWeight: 300, fontFamily: 'monospace', color: '#555' }}>
          <JsonView data={rawJson} shouldExpandNode={level => level < 3} />
        </div>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <footer style={{ marginTop: 40, textAlign: 'center', color: '#777' }}>
        <a
          href="https://github.com/aigoncharov/trainer_state_viz"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}
