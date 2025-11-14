import axios from "axios";
import fs from "fs-extra";

const JIRA_BASE = "https://issues.apache.org/jira/rest/api/2";
const BATCH_SIZE = 50;
const REQUEST_TIMEOUT = 10000;

const buildSearchUrl = (projectKey, offset) => 
  `${JIRA_BASE}/search?jql=project=${projectKey}&startAt=${offset}&maxResults=${BATCH_SIZE}`;

const buildCommentUrl = (issueId) => `${JIRA_BASE}/issue/${issueId}/comment`;

async function retrieveIssues(projectKey, offset) {
  const endpoint = buildSearchUrl(projectKey, offset);
  const response = await axios.get(endpoint, { timeout: REQUEST_TIMEOUT });
  return response.data;
}

async function retrieveComments(issueId) {
  try {
    const endpoint = buildCommentUrl(issueId);
    const response = await axios.get(endpoint);
    return response.data.comments || [];
  } catch {
    return [];
  }
}

function getProgressState(projectKey) {
  const checkpointDir = "checkpoints";
  const checkpointFile = `${checkpointDir}/${projectKey}.json`;
  
  fs.ensureDirSync(checkpointDir);
  
  if (fs.existsSync(checkpointFile)) {
    return JSON.parse(fs.readFileSync(checkpointFile, "utf-8"));
  }
  
  return { startAt: 0 };
}

function updateProgressState(projectKey, state) {
  fs.ensureDirSync("checkpoints");
  fs.writeFileSync(
    `checkpoints/${projectKey}.json`, 
    JSON.stringify(state, null, 2)
  );
}

export async function fetchAndStore(projectKey) {
  const rawDataPath = "data/raw";
  fs.ensureDirSync(rawDataPath);

  let progress = getProgressState(projectKey);
  let offset = progress.startAt;

  console.log(`Continuing from offset ${offset}`);

  while (true) {
    const batch = await retrieveIssues(projectKey, offset);
    
    if (!batch.issues || batch.issues.length === 0) {
      break;
    }

    for (const issue of batch.issues) {
      const commentData = await retrieveComments(issue.key);
      
      const fullIssue = {
        ...issue,
        comments: commentData
      };

      const filename = `${rawDataPath}/${projectKey}_${issue.key}.json`;
      fs.writeJsonSync(filename, fullIssue, { spaces: 2 });
    }

    offset += BATCH_SIZE;
    updateProgressState(projectKey, { startAt: offset });
    console.log(`Progress: ${offset} issues processed`);
  }

  console.log(`Completed fetching ${projectKey}`);
}

