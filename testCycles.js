const getCycles = require('./getCycles');

const cycles = getCycles("1995-02-10", "21:15", 53.55, 10.00, "2025-05-20");

console.log("Langzeitzyklen:", JSON.stringify(cycles, null, 2));

