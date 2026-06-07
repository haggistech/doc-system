import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse JSDoc comments from source code
 * @param {string} content - Source code content
 * @returns {Array} Array of parsed JSDoc objects
 */
export function parseJSDoc(content) {
  const entries = [];

  // Split by JSDoc start markers
  const jsdocMatches = content.matchAll(/\/\*\*([\s\S]*?)\*\/\s*((?:export\s+)?(?:async\s+)?(?:default\s+)?(?:function|const|class|interface|type)\s+(\w+))/g);

  for (const match of jsdocMatches) {
    const jsdocText = match[1];
    const declaration = match[2];
    const name = match[3];

    const parsed = {
      name,
      type: declaration.includes('function') ? 'function' :
            declaration.includes('class') ? 'class' :
            declaration.includes('interface') ? 'interface' : 'type',
      description: '',
      params: [],
      returns: null,
      example: null,
      deprecated: false
    };

    // Clean JSDoc text: remove leading * and whitespace
    const lines = jsdocText.split('\n');
    const cleanedLines = lines.map(line => {
      const stripped = line.trim();
      return stripped.startsWith('*') ? stripped.slice(1).trim() : stripped;
    });
    const cleanedText = cleanedLines.join('\n').trim();

    // Extract description (everything before first @tag)
    const descMatch = cleanedText.match(/^([\s\S]+?)(?=@|\s*$)/);
    if (descMatch) {
      const desc = descMatch[1].trim();
      if (desc && !desc.startsWith('@')) {
        parsed.description = desc;
      }
    }

    // Extract params
    const paramLines = cleanedText.match(/@param\s+{([^}]+)}\s+(\w+)\s*-?\s*(.+)/g) || [];
    for (const paramLine of paramLines) {
      const paramMatch = paramLine.match(/@param\s+{([^}]+)}\s+(\w+)\s*-?\s*(.+)/);
      if (paramMatch) {
        parsed.params.push({
          name: paramMatch[2],
          type: paramMatch[1].trim(),
          description: paramMatch[3].trim()
        });
      }
    }

    // Extract returns
    const returnMatch = cleanedText.match(/@returns?\s+{([^}]+)}\s*(.+?)(?=\n@|$)/);
    if (returnMatch) {
      parsed.returns = {
        type: returnMatch[1].trim(),
        description: returnMatch[2].trim()
      };
    }

    // Check for deprecated
    if (cleanedText.includes('@deprecated')) {
      parsed.deprecated = true;
    }

    // Extract example - everything after @example until next @tag or end
    const exampleStartIndex = cleanedText.indexOf('@example');
    if (exampleStartIndex !== -1) {
      const afterExample = cleanedText.substring(exampleStartIndex + '@example'.length);
      const nextTagIndex = afterExample.search(/\n\s*@/);
      let exampleText = nextTagIndex === -1 ? afterExample : afterExample.substring(0, nextTagIndex);
      parsed.example = exampleText.trim();
    }

    entries.push(parsed);
  }

  return entries;
}

/**
 * Generate markdown for API documentation
 * @param {Array} entries - Parsed JSDoc entries
 * @param {string} fileName - Source file name
 * @returns {string} Markdown content
 */
export function generateAPIMarkdown(entries, fileName) {
  let markdown = `# API Reference: ${path.basename(fileName, path.extname(fileName))}\n\n`;

  for (const entry of entries) {
    const heading = `## \`${entry.name}\``;
    markdown += `${heading} {#${entry.name}}\n\n`;

    if (entry.deprecated) {
      markdown += `:::warning Deprecated\nThis ${entry.type} is deprecated.\n:::\n\n`;
    }

    markdown += `**Type:** \`${entry.type}\`\n\n`;

    if (entry.description) {
      markdown += `${entry.description}\n\n`;
    }

    if (entry.params.length > 0) {
      markdown += `### Parameters\n\n`;
      markdown += `| Name | Type | Description |\n`;
      markdown += `|------|------|-------------|\n`;
      for (const param of entry.params) {
        markdown += `| \`${param.name}\` | \`${param.type}\` | ${param.description} |\n`;
      }
      markdown += '\n';
    }

    if (entry.returns) {
      markdown += `### Returns\n\n`;
      markdown += `\`${entry.returns.type}\` - ${entry.returns.description}\n\n`;
    }

    if (entry.example) {
      markdown += `### Example\n\n\`\`\`javascript\n${entry.example}\n\`\`\`\n\n`;
    }
  }

  return markdown;
}

/**
 * Extract and generate API docs from source files
 * @param {Array} sourceFiles - Array of source file paths
 * @param {string} outputDir - Output directory for generated docs
 * @returns {Promise<Array>} Array of generated file paths
 */
export async function generateAPIDocsFromFiles(sourceFiles, outputDir) {
  const generated = [];

  for (const filePath of sourceFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const entries = parseJSDoc(content);

      if (entries.length === 0) continue;

      const fileName = path.basename(filePath, path.extname(filePath));
      const markdown = generateAPIMarkdown(entries, filePath);
      const outputPath = path.join(outputDir, `${fileName}-api.md`);

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, markdown);

      generated.push(outputPath);
      console.log(`✓ Generated API docs: ${outputPath}`);
    } catch (err) {
      console.error(`✗ Error processing ${filePath}:`, err.message);
    }
  }

  return generated;
}
