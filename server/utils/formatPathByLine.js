const Station = require('../models/Station');

async function formatPathByLine(path) {
  if (!path || path.length < 2) return [];
  
  const stations = await Station.find({ name: { $in: path } }).lean();
  const map = {};
  stations.forEach(s => {
    if (!map[s.name]) map[s.name] = [];
    map[s.name].push(s);
  });

  const segments = [];
  
  // Initial line detection
  let currentLine = map[path[0]].find(s => 
    map[path[1]].some(next => next.line === s.line)
  )?.line || map[path[0]][0].line;

  let segmentStart = path[0];
  let currentSegmentStations = [path[0]]; // 🟢 Start tracking stations

  for (let i = 1; i < path.length; i++) {
    const options = map[path[i]];
    const sameLine = options.find(s => s.line === currentLine);

    if (!sameLine) {
      // Line change detected: push existing segment
      segments.push({
        from: segmentStart,
        to: path[i - 1],
        line: currentLine,
        stations: currentSegmentStations // 🟢 Now contains the array for .length
      });

      // Switch logic
      const interchangeOptions = map[path[i - 1]];
      const nextOptions = map[path[i]];
      const matchingLine = interchangeOptions.find(opt => 
        nextOptions.some(next => next.line === opt.line)
      );

      currentLine = matchingLine ? matchingLine.line : options[0].line;
      segmentStart = path[i - 1]; 
      currentSegmentStations = [path[i - 1], path[i]]; // 🟢 Restart with interchange station
    } else {
      currentSegmentStations.push(path[i]); // 🟢 Keep adding stations to current segment
    }
  }

  // Push final segment
  segments.push({
    from: segmentStart,
    to: path[path.length - 1],
    line: currentLine,
    stations: currentSegmentStations // 🟢 Final array
  });

  return segments;
}

module.exports = formatPathByLine;