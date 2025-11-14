# WEB SCRAPING TUTOR ASSIGNMENT
# JIRA Data Extractor

A lightweight Node.js tool for extracting issue data from Apache's public JIRA instance and converting it to JSONL format.

## Overview

This application retrieves issue tickets from Apache JIRA projects, including their metadata, descriptions, and comment threads. The extracted data is stored in a structured format suitable for downstream analysis or machine learning tasks.

## How It Works

The tool operates in two phases:

**Phase 1: Data Retrieval**
- Queries the JIRA REST API for specified projects
- Downloads issue details and associated comments
- Stores each issue as an individual JSON file
- Maintains progress checkpoints for resumable execution

**Phase 2: Data Processing**
- Reads the collected JSON files
- Extracts relevant fields and normalizes the structure
- Outputs consolidated JSONL files (one per project)

## Setup

Install dependencies:

```bash
npm install
```

## Running the Tool

```bash
npm start
```

By default, the tool processes three Apache projects: SPARK, HADOOP, and KAFKA. You can modify the project list in `index.js`.

## Output Structure

Generated files are organized as follows:

```
data/
├── raw/              # Individual JSON files per issue
└── jsonl/            # Consolidated JSONL output per project

checkpoints/          # Resume state for each project
```

Each JSONL record contains:

- Issue identifier and title
- Reporter and assignee information
- Status, priority, and labels
- Creation and update timestamps
- Full description text
- Array of comments with author and timestamp

## Technical Details

**API Endpoints Used:**
- Issue search: `/rest/api/2/search`
- Comments: `/rest/api/2/issue/{key}/comment`

**Features:**
- Automatic pagination handling (50 issues per request)
- Checkpoint-based resumption after interruptions
- Graceful error handling for missing or malformed data
- Timeout protection for slow API responses

## Requirements

Node.js version 18 or higher

# 📌 Edge Cases Handled

| Edge Case | Handling |
|----------|----------|
| API returns 0 issues | Stop pagination |
| Comments API fails | Continue without comments |
| Missing fields | Safe fallbacks |
| Script interrupts | Resume from last checkpoint |
| Malformed data | Skipped with guard checks |


## Dependencies

- `axios` - HTTP client for API requests
- `fs-extra` - Enhanced file system operations
- `jsonlines` - JSONL format handling

## Notes

This tool accesses only publicly available data from Apache's JIRA instance. No authentication is required. The sequential request pattern respects API rate limits.
