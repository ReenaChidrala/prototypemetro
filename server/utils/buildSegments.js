const Station = require('../models/Station');
const genToken = require('./generateToken');

async function buildSegments(path, journeyId) {
  const segments = [];
  if (!path || path.length < 2) return segments;

  const stations = await Station.find({ name: { $in: path } }).lean();
  const map = {};
  stations.forEach(s => {
    if (!map[s.name]) map[s.name] = [];
    map[s.name].push(s);
  });

  let order = 0;
  let currentLine = map[path[0]].find(s => 
    map[path[1]].some(next => next.line === s.line)
  )?.line || map[path[0]][0].line;

  let segmentStart = path[0];

  for (let i = 1; i < path.length; i++) {
    const options = map[path[i]];
    const sameLine = options.find(s => s.line === currentLine);

    if (!sameLine) {
      // 🟢 Push Segment (Interchange detected)
      segments.push({
        journeyId,
        segmentOrder: order++,
        fromStation: segmentStart, // ✅ Required by Schema
        toStation: path[i - 1],    // ✅ Required by Schema
        line: currentLine,
        type: order === 1 ? 'ENTRY' : 'INTERCHANGE', // ✅ Required by Schema
        token: genToken(),
        scanned: false
      });

      const interchangeOptions = map[path[i - 1]];
      const nextOptions = map[path[i]];
      const matchingLine = interchangeOptions.find(opt => 
        nextOptions.some(next => next.line === opt.line)
      );

      currentLine = matchingLine ? matchingLine.line : options[0].line;
      segmentStart = path[i - 1]; 
    }
  }

  // 🟢 Push Final Segment
  segments.push({
    journeyId,
    segmentOrder: order++,
    fromStation: segmentStart,
    toStation: path[path.length - 1],
    line: currentLine,
    type: order === 1 ? 'ENTRY' : 'EXIT', // ✅ Required by Schema
    token: genToken(),
    scanned: false
  });

  return segments;
}

module.exports = buildSegments;