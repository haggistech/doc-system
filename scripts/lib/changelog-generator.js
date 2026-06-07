import { execSync } from 'child_process';

/**
 * Get all git tags sorted by version
 * @param {string} cwd - Working directory
 * @returns {Array} Array of tag objects with name and date
 */
export function getGitTags(cwd = '.') {
  try {
    const output = execSync('git tag -l --sort=-version:refname', { cwd, encoding: 'utf-8' });
    const tags = output.trim().split('\n').filter(Boolean);

    return tags.map(tag => {
      try {
        const date = execSync(`git log -1 --format=%ai ${tag}`, { cwd, encoding: 'utf-8' }).trim();
        const message = execSync(`git tag -l --format=%(contents) ${tag}`, { cwd, encoding: 'utf-8' }).trim();
        return { tag, date: date.split(' ')[0], message };
      } catch {
        return { tag, date: null, message: '' };
      }
    });
  } catch (err) {
    console.error('Error reading git tags:', err.message);
    return [];
  }
}

/**
 * Get commits between two refs
 * @param {string} fromRef - Starting ref (tag or commit)
 * @param {string} toRef - Ending ref (tag or commit)
 * @param {string} cwd - Working directory
 * @returns {Array} Array of commit objects
 */
export function getCommitsBetween(fromRef, toRef, cwd = '.') {
  try {
    const output = execSync(
      `git log ${fromRef}..${toRef} --pretty=format:"%H|%s|%b|%an"`,
      { cwd, encoding: 'utf-8' }
    );

    return output.trim().split('\n').filter(Boolean).map(line => {
      const [hash, subject, body, author] = line.split('|');
      return {
        hash: hash.substring(0, 7),
        subject: subject.trim(),
        body: body.trim(),
        author: author.trim(),
        type: inferCommitType(subject)
      };
    });
  } catch (err) {
    return [];
  }
}

/**
 * Infer commit type from subject line
 * @param {string} subject - Commit subject
 * @returns {string} Commit type (feat, fix, docs, etc.)
 */
function inferCommitType(subject) {
  const subject_lower = subject.toLowerCase();
  if (subject_lower.startsWith('feat')) return 'feat';
  if (subject_lower.startsWith('fix')) return 'fix';
  if (subject_lower.startsWith('docs')) return 'docs';
  if (subject_lower.startsWith('style')) return 'style';
  if (subject_lower.startsWith('refactor')) return 'refactor';
  if (subject_lower.startsWith('perf')) return 'perf';
  if (subject_lower.startsWith('test')) return 'test';
  if (subject_lower.startsWith('chore')) return 'chore';
  if (subject_lower.includes('break')) return 'breaking';
  return 'other';
}

/**
 * Generate changelog markdown
 * @param {Array} tags - Array of tag objects
 * @param {string} cwd - Working directory
 * @returns {string} Markdown changelog
 */
export function generateChangelog(tags, cwd = '.') {
  let markdown = '# Changelog\n\nAll notable changes to this project are documented here.\n\n';

  for (let i = 0; i < tags.length; i++) {
    const currentTag = tags[i];
    const previousTag = tags[i + 1];
    const ref = previousTag ? `${previousTag.tag}..${currentTag.tag}` : `${currentTag.tag}`;

    markdown += `## [${currentTag.tag}](${ref}) - ${currentTag.date || 'Unreleased'}\n\n`;

    if (currentTag.message) {
      markdown += `${currentTag.message}\n\n`;
    }

    let commits = [];
    if (previousTag) {
      commits = getCommitsBetween(previousTag.tag, currentTag.tag, cwd);
    } else {
      // Get commits up to this tag
      try {
        const output = execSync(`git log ${currentTag.tag} --pretty=format:"%H|%s|%b|%an"`, {
          cwd,
          encoding: 'utf-8'
        });
        commits = output.trim().split('\n').filter(Boolean).map(line => {
          const [hash, subject, body, author] = line.split('|');
          return {
            hash: hash.substring(0, 7),
            subject: subject.trim(),
            body: body.trim(),
            author: author.trim(),
            type: inferCommitType(subject)
          };
        });
      } catch {
        commits = [];
      }
    }

    if (commits.length === 0) {
      markdown += '_No changes recorded._\n\n';
      continue;
    }

    // Group commits by type
    const groups = {};
    const typeLabels = {
      feat: '✨ Features',
      fix: '🐛 Bug Fixes',
      breaking: '⚠️ Breaking Changes',
      docs: '📝 Documentation',
      perf: '⚡ Performance',
      refactor: '♻️ Refactoring',
      style: '🎨 Styling',
      test: '✅ Tests',
      chore: '📦 Chores',
      other: '📋 Other'
    };

    for (const commit of commits) {
      if (!groups[commit.type]) {
        groups[commit.type] = [];
      }
      groups[commit.type].push(commit);
    }

    // Output by type
    for (const [type, commits_of_type] of Object.entries(groups)) {
      if (commits_of_type.length === 0) continue;
      markdown += `### ${typeLabels[type] || type}\n\n`;
      for (const commit of commits_of_type) {
        markdown += `- ${commit.subject} ([\`${commit.hash}\`](commit/${commit.hash}))`;
        if (commit.author) {
          markdown += ` — ${commit.author}`;
        }
        markdown += '\n';
      }
      markdown += '\n';
    }

    markdown += '\n';
  }

  return markdown;
}
