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

  // 🚪 ENTRY: Detect line by looking at where we are going (path[1])
  let currentLine = map[path[0]].find(s => 
    map[path[1]].some(next => next.line === s.line)
  )?.line || map[path[0]][0].line;

  segments.push({
    journeyId,
    segmentOrder: order++,
    fromStation: path[0],
    toStation: path[1],
    line: currentLine,
    type: 'ENTRY',
    token: genToken(),
    scanned: false
  });

  // 🔁 INTERCHANGES
  for (let i = 1; i < path.length - 1; i++) {
    const stationOptions = map[path[i]];
    const sameLine = stationOptions.find(s => s.line === currentLine);

    if (!sameLine) {
      // ✅ Switch Logic: Pick the line that connects this station to the NEXT one
      const nextOptions = map[path[i+1]];
      const matchingLine = stationOptions.find(opt => 
        nextOptions.some(next => next.line === opt.line)
      );

      currentLine = matchingLine ? matchingLine.line : stationOptions[0].line;

      segments.push({
        journeyId,
        segmentOrder: order++,
        fromStation: path[i],
        toStation: path[i+1],
        line: currentLine,
        type: 'INTERCHANGE',
        token: genToken(),
        scanned: false
      });
    }
  }

  // 🚪 EXIT
  segments.push({
    journeyId,
    segmentOrder: order++,
    fromStation: path[path.length - 2],
    toStation: path[path.length - 1],
    line: currentLine,
    type: 'EXIT',
    token: genToken(),
    scanned: false
  });

  return segments;
}

module.exports = buildSegments;