import { execSync } from 'child_process';

/**
 * Get Git metadata for a file (creation date, last updated, authors)
 * @param {string} filePath - Absolute path to the file
 * @param {string} rootDir - Root directory of the project
 * @returns {Object|null} Git metadata or null if not available
 */
export function getGitMetadata(filePath, rootDir) {
  try {
    // Get last updated info (most recent commit)
    const lastCommit = execSync(
      `git log -1 --format="%at|%an|%ae" "${filePath}"`,
      { encoding: 'utf-8', cwd: rootDir, shell: '/bin/bash' }
    ).trim();

    // Get creation info (first commit)
    const firstCommit = execSync(
      `git log --diff-filter=A --follow --format="%at|%an|%ae" -- "${filePath}"`,
      { encoding: 'utf-8', cwd: rootDir, shell: '/bin/bash' }
    ).trim().split('\n').pop(); // Get last line (oldest commit)

    if (!lastCommit) {
      return null;
    }

    const formatDate = (timestamp) => {
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const [lastTimestamp, lastAuthor, lastEmail] = lastCommit.split('|');
    const lastUpdated = formatDate(lastTimestamp);

    let created = null;
    let createdBy = null;

    if (firstCommit) {
      const [firstTimestamp, firstAuthor] = firstCommit.split('|');
      created = formatDate(firstTimestamp);
      createdBy = firstAuthor;
    }

    return {
      lastUpdated,
      lastUpdatedBy: lastAuthor,
      created,
      createdBy
    };
  } catch (err) {
    // Not a git repo or file not tracked
    return null;
  }
}
