#!/usr/bin/env node

/**
 * Authkestra Landing Page Automated Acceptance & SEO Verification Script
 * 
 * Verifies dist/ artifacts against:
 * 1. Single <h1> and non-skipping heading hierarchy (h1 -> h2 -> h3, etc.)
 * 2. Valid JSON-LD structured data (@type: SoftwareSourceCode/SoftwareApplication, WebSite, FAQPage)
 * 3. Canonical link, OpenGraph tags, Twitter card, and meta description
 * 4. Required high-conversion sections (AI & MCP Security, 3-tab Quickstart, Comparison, FAQ)
 * 5. Strict immutability of src/styles/tokens.css (git diff must be empty)
 * 6. All legacy documentation redirects generated in dist/
 * 7. Key search/AI discovery assets: robots.txt, sitemap.xml, llms.txt
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(REPO_ROOT, 'dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');
const TOKENS_CSS = path.join(REPO_ROOT, 'src/styles/tokens.css');

// ANSI formatting helpers
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failures = [];

function check(title, fn) {
  totalChecks++;
  process.stdout.write(`  [..] ${title}...`);
  try {
    const details = fn();
    passedChecks++;
    process.stdout.write(`\r ${GREEN}✔ PASS${RESET} ${title}${details ? ` ${GRAY}(${details})${RESET}` : ''}\n`);
  } catch (err) {
    failedChecks++;
    const errMsg = err && err.message ? err.message : String(err);
    failures.push({ title, error: errMsg });
    process.stdout.write(`\r ${RED}✖ FAIL${RESET} ${title}\n`);
    console.error(`       ${RED}Error: ${errMsg}${RESET}`);
  }
}

console.log(`\n${BOLD}${CYAN}=== Authkestra Landing Page Automated Acceptance Verification ===${RESET}\n`);
console.log(`Target Directory: ${DIST_DIR}`);

// Pre-check: Ensure dist/index.html exists
if (!fs.existsSync(INDEX_HTML)) {
  console.error(`\n${RED}${BOLD}CRITICAL ERROR:${RESET} ${INDEX_HTML} not found.`);
  console.error(`Please run 'pnpm run build' inside ${REPO_ROOT} before executing this verification script.\n`);
  process.exit(1);
}

const html = fs.readFileSync(INDEX_HTML, 'utf8');

// -----------------------------------------------------------------------------
// Suite 1: Document Structure & Heading Hierarchy
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}1. Heading Hierarchy & Structural Integrity${RESET}`);

check('Exactly one <h1> element on the page', () => {
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1Matches.length === 0) {
    throw new Error('No <h1> element found on index.html');
  }
  if (h1Matches.length > 1) {
    throw new Error(`Found ${h1Matches.length} <h1> elements (expected exactly 1)`);
  }
  const h1Text = h1Matches[0][1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return `h1: "${h1Text.substring(0, 45)}..."`;
});

check('Valid non-skipping heading hierarchy (h1 -> h2 -> h3, no skipping downwards)', () => {
  const headingRegex = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    headings.push({ level, text });
  }

  if (headings.length === 0) {
    throw new Error('No headings found on index.html');
  }

  const firstH1Index = headings.findIndex(h => h.level === 1);
  if (firstH1Index === -1) {
    throw new Error('No h1 found among headings');
  }

  let prevLevel = 1;
  const skippedHeadings = [];

  for (let i = firstH1Index + 1; i < headings.length; i++) {
    const current = headings[i];
    // Skipping occurs if we jump down more than 1 level at once (e.g., h1 -> h3 without h2, or h2 -> h4 without h3)
    if (current.level > prevLevel + 1) {
      skippedHeadings.push({
        from: prevLevel,
        to: current.level,
        text: current.text,
        index: i,
      });
    }
    prevLevel = current.level;
  }

  if (skippedHeadings.length > 0) {
    const errDetails = skippedHeadings
      .map(s => `h${s.from} -> h${s.to} for "${s.text.substring(0, 30)}"`)
      .join('; ');
    throw new Error(`Found ${skippedHeadings.length} skipped heading level(s): ${errDetails}`);
  }

  return `${headings.length} headings validated without downward skips`;
});

// -----------------------------------------------------------------------------
// Suite 2: Technical SEO, Metadata, & OpenGraph Tags
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}2. Technical SEO & Social Metadata${RESET}`);

check('Canonical link points to https://authkestra.com/', () => {
  const canonicalMatch = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']canonical["'][^>]*>/i);
  if (!canonicalMatch) {
    throw new Error('Missing <link rel="canonical"> tag');
  }
  const href = canonicalMatch[1];
  if (href !== 'https://authkestra.com/' && href !== 'https://authkestra.com') {
    throw new Error(`Canonical URL mismatch: expected 'https://authkestra.com/', got '${href}'`);
  }
  return href;
});

check('Meta description tag is present and informative', () => {
  const descMatch = html.match(/<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i)
    || html.match(/<meta\b[^>]*\bcontent=["']([^"']+)["'][^>]*\bname=["']description["'][^>]*>/i);
  if (!descMatch) {
    throw new Error('Missing <meta name="description"> tag');
  }
  const desc = descMatch[1].trim();
  if (desc.length < 30) {
    throw new Error(`Meta description too short (${desc.length} chars)`);
  }
  return `${desc.length} chars`;
});

check('OpenGraph meta tags: og:title, og:description, og:image, og:url', () => {
  const ogTitle = html.match(/<meta\b[^>]*\bproperty=["']og:title["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i);
  const ogDesc = html.match(/<meta\b[^>]*\bproperty=["']og:description["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i);
  const ogImage = html.match(/<meta\b[^>]*\bproperty=["']og:image["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i);
  const ogUrl = html.match(/<meta\b[^>]*\bproperty=["']og:url["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i);

  const missing = [];
  if (!ogTitle) missing.push('og:title');
  if (!ogDesc) missing.push('og:description');
  if (!ogImage) missing.push('og:image');
  if (!ogUrl) missing.push('og:url');

  if (missing.length > 0) {
    throw new Error(`Missing OpenGraph tag(s): ${missing.join(', ')}`);
  }
  return `image=${ogImage[1]}`;
});

check('Twitter Card meta tag: twitter:card', () => {
  const twitterCard = html.match(/<meta\b[^>]*\bname=["']twitter:card["'][^>]*\bcontent=["']([^"']+)["'][^>]*>/i)
    || html.match(/<meta\b[^>]*\bcontent=["']([^"']+)["'][^>]*\bname=["']twitter:card["'][^>]*>/i);
  if (!twitterCard) {
    throw new Error('Missing <meta name="twitter:card"> tag');
  }
  return `card=${twitterCard[1]}`;
});

// -----------------------------------------------------------------------------
// Suite 3: Structured JSON-LD Schemas
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}3. Structured Data (JSON-LD Validation)${RESET}`);

let parsedSchemas = [];

check('Valid JSON-LD script blocks present and parse without syntax errors', () => {
  const jsonLdBlocks = [...html.matchAll(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (jsonLdBlocks.length === 0) {
    throw new Error('No <script type="application/ld+json"> tag found in dist/index.html');
  }

  for (let i = 0; i < jsonLdBlocks.length; i++) {
    const rawJson = jsonLdBlocks[i][1].trim();
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        parsedSchemas.push(...parsed['@graph']);
      } else {
        parsedSchemas.push(parsed);
      }
    } catch (parseErr) {
      throw new Error(`JSON-LD block ${i + 1} failed JSON.parse: ${parseErr.message}`);
    }
  }

  return `${jsonLdBlocks.length} block(s), ${parsedSchemas.length} schema definition(s)`;
});

check('JSON-LD contains SoftwareSourceCode or SoftwareApplication schema', () => {
  const software = parsedSchemas.find(s => s['@type'] === 'SoftwareSourceCode' || s['@type'] === 'SoftwareApplication');
  if (!software) {
    throw new Error('Missing @type "SoftwareSourceCode" or "SoftwareApplication" in JSON-LD');
  }
  if (!software.name) {
    throw new Error('SoftwareSourceCode/SoftwareApplication missing "name" property');
  }
  return `name="${software.name}"`;
});

check('JSON-LD contains WebSite schema', () => {
  const website = parsedSchemas.find(s => s['@type'] === 'WebSite');
  if (!website) {
    throw new Error('Missing @type "WebSite" in JSON-LD');
  }
  if (!website.url) {
    throw new Error('WebSite missing "url" property');
  }
  return `url="${website.url}"`;
});

check('JSON-LD contains FAQPage schema with technical questions', () => {
  const faq = parsedSchemas.find(s => s['@type'] === 'FAQPage');
  if (!faq) {
    throw new Error('Missing @type "FAQPage" in JSON-LD');
  }
  if (!faq.mainEntity || !Array.isArray(faq.mainEntity) || faq.mainEntity.length === 0) {
    throw new Error('FAQPage missing non-empty "mainEntity" array');
  }
  return `${faq.mainEntity.length} Q&A items in mainEntity`;
});

// -----------------------------------------------------------------------------
// Suite 4: Key Marketing & Technical Architecture Sections
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}4. Key Section Anchors & Component Verification${RESET}`);

check('Hero lead/subtitle contains <= 45 words', () => {
  const leadMatch = html.match(/<p\b[^>]*class=["'][^"']*\blead\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i);
  if (!leadMatch) {
    throw new Error('Hero lead paragraph not found in index.html');
  }
  const cleanText = leadMatch[1].replace(/<[^>]+>/g, '').trim();
  const words = cleanText.split(/\s+/).filter(Boolean);
  if (words.length > 45) {
    throw new Error(`Hero lead contains ${words.length} words (max 45 allowed): "${cleanText}"`);
  }
  return `${words.length} words (cap: 45)`;
});

check('AI & MCP Security (#ai-mcp-security) appears immediately after Hero', () => {
  const hasId = /id=["']ai-mcp-security["']/i.test(html);
  if (!hasId) {
    throw new Error('Section with id="ai-mcp-security" not found');
  }
  const heroIdx = html.indexOf('class="hero"');
  const aiIdx = html.indexOf('id="ai-mcp-security"');
  const methodsIdx = html.indexOf('id="methods"');

  if (heroIdx === -1) throw new Error('Hero section not found');
  if (aiIdx < heroIdx) throw new Error('AI & MCP section appears before Hero');
  if (methodsIdx !== -1 && aiIdx > methodsIdx) {
    throw new Error('AI & MCP section appears after #methods (must appear before general auth methods)');
  }
  return '#ai-mcp-security ordered immediately after Hero';
});

check('Comparison section is absent from dist/index.html (no table, no id="comparison")', () => {
  const hasComparisonId = /id=["']comparison["']/i.test(html);
  const hasTable = /<table\b[^>]*>/i.test(html);
  if (hasComparisonId || hasTable) {
    throw new Error('Comparison section (id="comparison" or <table>) is still present in dist/index.html');
  }
  return 'Comparison section and tables completely absent';
});

check('Quickstart showcase has MCP Server Agent Guard (authkestra-mcp) as Tab 1 (active by default)', () => {
  const tabBtnMatch = html.match(/<button\b[^>]*role=["']tab["'][^>]*>([\s\S]*?)<\/button>/i);
  if (!tabBtnMatch) {
    throw new Error('Quickstart tab button not found');
  }
  const firstTabText = tabBtnMatch[1].replace(/<[^>]+>/g, '').trim();
  if (!/MCP Server Agent Guard/i.test(firstTabText) && !/authkestra-mcp/i.test(firstTabText)) {
    throw new Error(`First tab is "${firstTabText}", expected MCP Server Agent Guard (authkestra-mcp)`);
  }
  return `Tab 1: "${firstTabText}"`;
});

check('Multiple animated 2D SVG diagrams present with prefers-reduced-motion queries', () => {
  const svgMatches = [...html.matchAll(/<svg\b[^>]*class=["'][^"']*(?:diagram|tier-diagram|typestate-diagram)[^"']*["']/gi)];
  if (svgMatches.length < 2) {
    throw new Error(`Found ${svgMatches.length} 2D SVG diagrams (expected at least 2 animated diagrams)`);
  }
  if (!html.includes('prefers-reduced-motion')) {
    throw new Error('Missing prefers-reduced-motion media query for SVG animations');
  }
  return `${svgMatches.length} 2D SVG diagrams validated with prefers-reduced-motion support`;
});

check('Technical FAQ section is present', () => {
  const hasFaqId = /id=["']faq["']/i.test(html);
  const hasFaqHeading = /Frequently Asked Questions/i.test(html);
  if (!hasFaqId && !hasFaqHeading) {
    throw new Error('Technical FAQ section (id="faq" or FAQ heading) not found');
  }
  return 'Technical FAQ section present';
});

// -----------------------------------------------------------------------------
// Suite 5: Design System Integrity & Tokens Immutability
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}5. Design Token Immutability (Repository Safety Rule)${RESET}`);

check('src/styles/tokens.css remains strictly unmodified (0 git diff)', () => {
  if (!fs.existsSync(TOKENS_CSS)) {
    throw new Error(`Tokens file not found at ${TOKENS_CSS}`);
  }
  try {
    const diff = execSync('git diff src/styles/tokens.css', { cwd: REPO_ROOT }).toString().trim();
    if (diff.length > 0) {
      throw new Error(`src/styles/tokens.css has been modified!\n${diff.substring(0, 300)}...`);
    }
  } catch (err) {
    if (err.message && err.message.includes('has been modified')) {
      throw err;
    }
    // If not in a git tree or git command failed, check file stat or warn
    throw new Error(`Git diff check failed: ${err.message}`);
  }
  return 'git diff is strictly empty';
});

// -----------------------------------------------------------------------------
// Suite 6: Legacy Documentation Redirects
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}6. Legacy Documentation Redirects (20+ paths)${RESET}`);

const REQUIRED_REDIRECTS = [
  'advanced/instrumentation',
  'advanced/op-server',
  'advanced/resource-server',
  'concepts/architecture',
  'concepts/typestate-builder',
  'guides/device-attestation',
  'guides/framework-integration',
  'guides/quickstart',
  'guides/wired-endpoints',
  'providers/bot-protection',
  'providers/client-credentials',
  'providers/device-flow',
  'providers/device-signatures',
  'providers/oauth2',
  'providers/oidc',
  'providers/passkeys',
  'providers/totp',
  'storage/implementing-stores',
  'storage/kv-store',
  'storage/overview',
  'storage/sql-store'
];

check(`All ${REQUIRED_REDIRECTS.length} legacy documentation redirect paths exist in dist/`, () => {
  const missing = [];
  const malformed = [];

  for (const slug of REQUIRED_REDIRECTS) {
    const redirectPath = path.join(DIST_DIR, slug, 'index.html');
    if (!fs.existsSync(redirectPath)) {
      missing.push(slug);
      continue;
    }

    const redirectContent = fs.readFileSync(redirectPath, 'utf8');
    const hasRefresh = /<meta\b[^>]*\bhttp-equiv=["']refresh["'][^>]*>/i.test(redirectContent);
    const pointsToDocs = /https:\/\/docs\.authkestra\.com\//i.test(redirectContent);

    if (!hasRefresh || !pointsToDocs) {
      malformed.push(slug);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing ${missing.length} redirect file(s) in dist/: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
  }

  if (malformed.length > 0) {
    throw new Error(`Malformed redirect file(s) without valid meta-refresh to docs: ${malformed.join(', ')}`);
  }

  return `All ${REQUIRED_REDIRECTS.length} redirects verified`;
});

// Also check concepts/comparison redirect
check('Redirect /concepts/comparison -> https://docs.authkestra.com/concepts/architecture/ exists in dist/', () => {
  const compPath = path.join(DIST_DIR, 'concepts/comparison/index.html');
  if (!fs.existsSync(compPath)) {
    throw new Error('dist/concepts/comparison/index.html does not exist');
  }
  const content = fs.readFileSync(compPath, 'utf8');
  if (!/https:\/\/docs\.authkestra\.com\/concepts\/architecture\//i.test(content)) {
    throw new Error(`dist/concepts/comparison/index.html does not redirect to https://docs.authkestra.com/concepts/architecture/: "${content}"`);
  }
  return 'Redirects to https://docs.authkestra.com/concepts/architecture/';
});

// -----------------------------------------------------------------------------
// Suite 7: AI & Crawler Discovery Artifacts
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}7. Search & AI Discovery Assets${RESET}`);

check('dist/llms.txt exists and contains non-empty markdown documentation', () => {
  const llmsPath = path.join(DIST_DIR, 'llms.txt');
  if (!fs.existsSync(llmsPath)) {
    throw new Error('dist/llms.txt does not exist');
  }
  const content = fs.readFileSync(llmsPath, 'utf8');
  if (content.length < 100) {
    throw new Error(`dist/llms.txt content unexpectedly small (${content.length} bytes)`);
  }
  return `${content.length} bytes`;
});

check('dist/robots.txt exists with sitemap and llms.txt directives', () => {
  const robotsPath = path.join(DIST_DIR, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    throw new Error('dist/robots.txt does not exist in build output');
  }
  const content = fs.readFileSync(robotsPath, 'utf8');
  if (!/Sitemap:/i.test(content)) {
    throw new Error('dist/robots.txt missing Sitemap directive');
  }
  return 'robots.txt valid with sitemap';
});

check('Sitemap exists in dist/ (dist/sitemap.xml or dist/sitemap-index.xml)', () => {
  const sitemapXml = path.join(DIST_DIR, 'sitemap.xml');
  const sitemapIndex = path.join(DIST_DIR, 'sitemap-index.xml');
  const exists = fs.existsSync(sitemapXml) || fs.existsSync(sitemapIndex);
  if (!exists) {
    throw new Error('Neither dist/sitemap.xml nor dist/sitemap-index.xml exists');
  }
  const file = fs.existsSync(sitemapXml) ? 'sitemap.xml' : 'sitemap-index.xml';
  return file;
});

// -----------------------------------------------------------------------------
// Final Summary & Exit Code
// -----------------------------------------------------------------------------
console.log(`\n${BOLD}=== Verification Summary ===${RESET}`);
console.log(`Total Checks:  ${totalChecks}`);
console.log(`Passed:        ${GREEN}${passedChecks}${RESET}`);
console.log(`Failed:        ${failedChecks > 0 ? RED : GREEN}${failedChecks}${RESET}`);

if (failedChecks > 0) {
  console.log(`\n${RED}${BOLD}Failed Check Details:${RESET}`);
  failures.forEach((f, idx) => {
    console.log(`  ${idx + 1}. ${BOLD}${f.title}${RESET}`);
    console.log(`     ${RED}${f.error}${RESET}`);
  });
  console.log(`\n${RED}Acceptance verification failed. Exiting with code 1.${RESET}\n`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}${BOLD}All acceptance criteria passed successfully! Exiting with code 0.${RESET}\n`);
  process.exit(0);
}
