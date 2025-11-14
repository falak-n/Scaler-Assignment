import fs from "fs-extra";
import jsonlines from "jsonlines";

function extractIssueData(rawIssue, projectKey) {
  const fields = rawIssue.fields;
  
  return {
    issue_key: rawIssue.key,
    title: fields.summary,
    project: projectKey,
    reporter: fields.reporter?.displayName,
    assignee: fields.assignee?.displayName,
    status: fields.status?.name,
    priority: fields.priority?.name,
    labels: fields.labels || [],
    created: fields.created,
    updated: fields.updated,
    description: fields.description || "",
    comments: rawIssue.comments.map(comment => ({
      author: comment.author.displayName,
      body: comment.body,
      created: comment.created
    }))
  };
}

export function processRawData(projectKey) {
  const outputDir = "data/jsonl";
  fs.ensureDirSync(outputDir);

  const outputPath = `${outputDir}/${projectKey}.jsonl`;
  const outputStream = fs.createWriteStream(outputPath);
  const jsonlWriter = jsonlines.stringify();
  
  jsonlWriter.pipe(outputStream);

  const rawFiles = fs.readdirSync("data/raw");
  const projectFiles = rawFiles.filter(filename => filename.startsWith(projectKey));

  for (const filename of projectFiles) {
    const filePath = `data/raw/${filename}`;
    const rawIssue = fs.readJsonSync(filePath);
    const processedIssue = extractIssueData(rawIssue, projectKey);
    jsonlWriter.write(processedIssue);
  }

  jsonlWriter.end();
  console.log(`Output saved: ${outputPath}`);
}

