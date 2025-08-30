import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const FLOORS = Array.from({ length: 10 }, (_, i) => i + 1);

function roomNumbersForFloor(floor) {
  if (floor === 10) {
    return Array.from({ length: 7 }, (_, i) => 1000 + (i + 1)); // 1001..1007
  }
  return Array.from({ length: 10 }, (_, i) => floor * 100 + (i + 1)); // 101..110, 201..210...
}

function positionFromRoomNumber(floor, roomNumber) {
  if (floor === 10) return roomNumber - 1000; // 1001->1
  return roomNumber - floor * 100; // 101->1, 110->10
}

function travelTimeBetween(f1, p1, f2, p2) {
  if (f1 === f2) return Math.abs(p1 - p2);
  return (p1 - 1) + 2 * Math.abs(f1 - f2) + (p2 - 1);
}

// ------------------------
// In-memory state
// ------------------------
let occupancy = {}; // key: roomNumber, value: 'available' | 'booked'
let lastBooking = { rooms: [], travelTime: 0 };

function initState() {
  occupancy = {};
  for (const f of FLOORS) {
    for (const rn of roomNumbersForFloor(f)) {
      occupancy[rn] = "available";
    }
  }
  lastBooking = { rooms: [], travelTime: 0 };
}

initState();

// Helpers
function getAvailablePositionsByFloor() {
  const result = {};
  for (const f of FLOORS) {
    const rooms = roomNumbersForFloor(f);
    const positions = rooms
      .filter((rn) => occupancy[rn] === "available")
      .map((rn) => positionFromRoomNumber(f, rn))
      .sort((a, b) => a - b);
    result[f] = positions;
  }
  return result;
}

function bestWindowOnFloor(availPositions, s) {
  if (availPositions.length < s) return null;
  let best = null;
  for (let i = 0; i + s - 1 < availPositions.length; i++) {
    const window = availPositions.slice(i, i + s);
    const span = window[window.length - 1] - window[0];
    const leftmost = window[0];
    if (
      !best ||
      span < best.span ||
      (span === best.span && leftmost < best.leftmost)
    ) {
      best = { positions: window, span, leftmost };
    }
  }
  return best;
}

function candidateWindows(availByFloor, k) {
  const candidates = {};
  for (const f of FLOORS) {
    const avail = availByFloor[f] || [];
    candidates[f] = [];
    const maxS = Math.min(k, avail.length);
    for (let s = 1; s <= maxS; s++) {
      const win = bestWindowOnFloor(avail, s);
      if (win) {
        candidates[f].push({ size: s, positions: win.positions, span: win.span });
      }
    }
  }
  return candidates;
}

function combinedTravelTime(selection) {
  if (selection.length === 0) return 0;

  const floors = [...new Set(selection.map(s => s.floor))].sort((a,b)=>a-b);
  const minFloor = floors[0];
  const maxFloor = floors[floors.length - 1];

  const posOnMin = selection.filter(s => s.floor===minFloor).flatMap(s=>s.positions);
  const posOnMax = selection.filter(s => s.floor===maxFloor).flatMap(s=>s.positions);
  const minPosOnMin = Math.min(...posOnMin);
  const maxPosOnMax = Math.max(...posOnMax);

  const optionA = travelTimeBetween(minFloor, minPosOnMin, maxFloor, maxPosOnMax);

  const minPosOnMax = Math.min(...posOnMax);
  const posOnMin2 = posOnMin;
  const maxPosOnMin = Math.max(...posOnMin2);
  const optionB = travelTimeBetween(maxFloor, minPosOnMax, minFloor, maxPosOnMin);

  return Math.min(optionA, optionB);
}

function allocateRooms(k) {
  if (k < 1 || k > 5) {
    return { error: "You can book between 1 and 5 rooms." };
  }
  const availByFloor = getAvailablePositionsByFloor();
  const totalAvail = Object.values(availByFloor).reduce((acc, arr) => acc + arr.length, 0);
  if (totalAvail < k) {
    return { error: "Not enough rooms available to fulfill the request." };
  }

  // 1) Same-floor priority
  let bestSame = null;
  let bestSameFloor = null;
  for (const f of FLOORS) {
    const win = bestWindowOnFloor(availByFloor[f], k);
    if (win) {
      if (
        !bestSame ||
        win.span < bestSame.span ||
        (win.span === bestSame.span && (bestSameFloor === null || f < bestSameFloor))
      ) {
        bestSame = win;
        bestSameFloor = f;
      }
    }
  }
  if (bestSame) {
    const floor = bestSameFloor;
    const rooms = bestSame.positions.map(p => (floor === 10 ? 1000 + p : floor * 100 + p));
    return {
      selected: [{ floor, positions: bestSame.positions }],
      rooms,
      travelTime: bestSame.span
    };
  }

  // 2) Multi-floor: search
  const candidates = candidateWindows(availByFloor, k);
  const floorsList = FLOORS.filter(f => candidates[f].length > 0);

  let best = { travelTime: Number.POSITIVE_INFINITY, selection: null };

  function dfs(index, remaining, currentSel) {
    if (remaining === 0) {
      const tt = combinedTravelTime(currentSel);
      // Tie-breakers: fewer floors used, then smaller max position, then lower min floor
      const floorsUsed = new Set(currentSel.map(s => s.floor)).size;
      const maxPos = Math.max(...currentSel.flatMap(s => s.positions));
      const minFloor = Math.min(...currentSel.map(s => s.floor));
      const better =
        (tt < best.travelTime) ||
        (tt === best.travelTime && floorsUsed < (best.selection ? new Set(best.selection.map(s=>s.floor)).size : Infinity)) ||
        (tt === best.travelTime && floorsUsed === (best.selection ? new Set(best.selection.map(s=>s.floor)).size : Infinity) &&
         maxPos < (best.selection ? Math.max(...best.selection.flatMap(s=>s.positions)) : Infinity)) ||
        (tt === best.travelTime && floorsUsed === (best.selection ? new Set(best.selection.map(s=>s.floor)).size : Infinity) &&
         maxPos === (best.selection ? Math.max(...best.selection.flatMap(s=>s.positions)) : Infinity) &&
         minFloor < (best.selection ? Math.min(...best.selection.map(s=>s.floor)) : Infinity));

      if (better) {
        best = { travelTime: tt, selection: currentSel.map(s => ({ floor: s.floor, positions: [...s.positions] })) };
      }
      return;
    }
    if (index >= floorsList.length) return;

    const f = floorsList[index];

    // Option 1: pick nothing from this floor
    dfs(index + 1, remaining, currentSel);

    // Option 2: pick exactly one window from this floor (sizes up to remaining)
    for (const win of candidates[f]) {
      if (win.size <= remaining) {
        currentSel.push({ floor: f, positions: win.positions });
        dfs(index + 1, remaining - win.size, currentSel);
        currentSel.pop();
      }
    }
  }

  dfs(0, k, []);

  if (!best.selection) {
    return { error: "Unable to allocate rooms with current occupancy." };
  }
  // Build room numbers and return
  const rooms = [];
  for (const s of best.selection) {
    for (const p of s.positions) {
      const rn = s.floor === 10 ? 1000 + p : s.floor * 100 + p;
      rooms.push(rn);
    }
  }
  rooms.sort((a,b)=>a-b);
  return { selected: best.selection, rooms, travelTime: best.travelTime };
}

// ------------------------
// API
// ------------------------

app.get("/state", (req, res) => {
  const state = {};
  for (const f of FLOORS) {
    state[f] = roomNumbersForFloor(f).map(rn => ({
      roomNumber: rn,
      status: occupancy[rn]
    }));
  }
  res.json({ state, lastBooking });
});

app.post("/book", (req, res) => {
  const { count } = req.body || {};
  const k = Number(count);
  const result = allocateRooms(k);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  // Mark selected rooms as booked
  for (const rn of result.rooms) {
    occupancy[rn] = "booked";
  }
  lastBooking = { rooms: result.rooms, travelTime: result.travelTime };
  res.json({ rooms: result.rooms, travelTime: result.travelTime, selection: result.selected });
});

app.post("/reset", (req, res) => {
  initState();
  res.json({ ok: true });
});

app.post("/randomize", (req, res) => {
  const { occupancyRatio } = req.body || {};
  const ratio = Math.max(0, Math.min(1, occupancyRatio ?? 0.35)); // default 35% occupied
  // reset then randomize
  initState();
  for (const f of FLOORS) {
    const rooms = roomNumbersForFloor(f);
    for (const rn of rooms) {
      if (Math.random() < ratio) {
        occupancy[rn] = "booked";
      }
    }
  }
  lastBooking = { rooms: [], travelTime: 0 };
  res.json({ ok: true, ratio });
});

app.listen(4000, () => {
  console.log(`Backend running on port 4000`);
});