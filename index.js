import { fetchAndStore } from "./src/fetcher.js";
import { processRawData } from "./src/processor.js";

const APACHE_PROJECTS = ["SPARK", "HADOOP", "KAFKA"];

(async () => {
  for (const projectName of APACHE_PROJECTS) {
    console.log(`\n[${projectName}] Starting pipeline...`);
    await fetchAndStore(projectName);
    await processRawData(projectName);
  }
})();