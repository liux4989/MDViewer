#!/usr/bin/env node

/**
 * Case Sensitivity Checker
 * Compares Git tracked files with filesystem to catch case mismatches
 * that would cause issues on case-sensitive systems (Linux/GitHub Actions)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitFiles() {
  try {
    const output = execSync('git ls-files', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error getting Git files:', error.message);
    process.exit(1);
  }
}

function checkCaseSensitivity() {
  console.log('🔍 Checking for case sensitivity issues...\n');

  const gitFiles = getGitFiles();
  const issues = [];

  for (const gitFile of gitFiles) {
    // Skip non-existent files (they might be legitimately missing)
    if (!fs.existsSync(gitFile)) {
      // Check if there's a case-insensitive match
      const dir = path.dirname(gitFile);
      const filename = path.basename(gitFile);

      if (fs.existsSync(dir)) {
        try {
          const actualFiles = fs.readdirSync(dir);
          const caseInsensitiveMatch = actualFiles.find(
            file => file.toLowerCase() === filename.toLowerCase() && file !== filename
          );

          if (caseInsensitiveMatch) {
            issues.push({
              type: 'case_mismatch',
              gitPath: gitFile,
              actualPath: path.join(dir, caseInsensitiveMatch)
            });
          }
        } catch (e) {
          // Directory not readable, skip
        }
      }
    }
  }

  if (issues.length === 0) {
    console.log('✅ No case sensitivity issues found!');
    return true;
  }

  console.log('❌ Case sensitivity issues found:\n');

  for (const issue of issues) {
    console.log(`  Git tracks: ${issue.gitPath}`);
    console.log(`  Filesystem: ${issue.actualPath}`);
    console.log(`  Solution: git mv "${issue.actualPath}" "${issue.gitPath}"`);
    console.log('');
  }

  console.log(`Found ${issues.length} case sensitivity issue(s).`);
  console.log('These will cause build failures on Linux/GitHub Actions!');

  return false;
}

if (require.main === module) {
  const success = checkCaseSensitivity();
  process.exit(success ? 0 : 1);
}

module.exports = { checkCaseSensitivity };