const fs = require("fs");

const inputPath = "./rooms.json";    
const outputPath = "./rooms_final.json";  

function makeModelSimple(name) {
  return name.replace(" - ", "-") + ".glb";
}

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const updated = raw.map(item => ({
  name: item.name,
  model: makeModelSimple(item.name),
  arcgis: item.arcgis
}));

fs.writeFileSync(outputPath, JSON.stringify(updated, null, 2), "utf8");

console.log("Saved to rooms_final.json");
