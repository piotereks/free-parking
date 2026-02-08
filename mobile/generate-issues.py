#!/usr/bin/env python3
"""
Generate GitHub issues from TINY_MODIFICATIONS.md

This script parses the TINY_MODIFICATIONS.md file and creates individual
issue files that can be used with GitHub CLI to create issues.

Usage:
    python3 generate-issues.py [--output-dir OUTPUT_DIR] [--dry-run]

Options:
    --output-dir DIR    Directory to output issue files (default: ./issues)
    --dry-run          Print issues without creating files
    --help             Show this help message
"""

import re
import os
import sys
import argparse
from pathlib import Path


def parse_modifications(md_file):
    """Parse TINY_MODIFICATIONS.md and extract all modifications."""
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modifications = []
    current_category = None
    current_mod = None
    
    lines = content.split('\n')
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Detect category headers (## Code Quality & Maintenance)
        if line.startswith('## ') and not line.startswith('### '):
            current_category = line[3:].strip()
            i += 1
            continue
        
        # Detect modification headers (### 1. Add PropTypes...)
        if line.startswith('### '):
            # Save previous modification
            if current_mod:
                modifications.append(current_mod)
            
            # Parse title: "### 1. Add PropTypes to All Components"
            match = re.match(r'### (\d+)\.\s+(.+)', line)
            if match:
                num = match.group(1)
                title = match.group(2)
                current_mod = {
                    'number': int(num),
                    'title': title,
                    'category': current_category,
                    'files': [],
                    'description': '',
                    'benefit': '',
                    'time': ''
                }
            i += 1
            continue
        
        # Parse modification details
        if current_mod:
            if line.startswith('- **File(s)**:'):
                current_mod['files'] = line.replace('- **File(s)**:', '').strip()
            elif line.startswith('- **Description**:'):
                current_mod['description'] = line.replace('- **Description**:', '').strip()
            elif line.startswith('- **Benefit**:'):
                current_mod['benefit'] = line.replace('- **Benefit**:', '').strip()
            elif line.startswith('- **Estimated Time**:'):
                current_mod['time'] = line.replace('- **Estimated Time**:', '').strip()
        
        i += 1
    
    # Save last modification
    if current_mod:
        modifications.append(current_mod)
    
    return modifications


def get_category_label(category):
    """Map category to GitHub label."""
    category_map = {
        'Code Quality & Maintenance': 'code-quality',
        'UI/UX Improvements': 'ui-ux',
        'Performance Optimizations': 'performance',
        'Testing & Validation': 'testing',
        'Documentation': 'documentation',
        'Accessibility': 'accessibility',
        'Developer Experience': 'dx',
        'Error Handling & Resilience': 'error-handling',
        'Data & Caching': 'data',
        'Configuration & Settings': 'configuration',
        'Quick Wins': 'quick-win',
        'Future Phase 2 Preparation': 'phase-2',
        'Phase 3 Preparation': 'phase-3',
        'Low Priority / Nice to Have': 'low-priority'
    }
    return category_map.get(category, 'enhancement')


def get_priority_label(mod):
    """Determine priority based on category and time."""
    if 'Quick Win' in mod['category']:
        return 'good-first-issue'
    if 'Low Priority' in mod['category']:
        return 'low-priority'
    return None


def format_issue(mod):
    """Format a modification as a GitHub issue."""
    labels = ['mobile', 'enhancement', get_category_label(mod['category'])]
    priority = get_priority_label(mod)
    if priority:
        labels.append(priority)
    
    # Format labels for gh CLI
    labels_str = ','.join(labels)
    
    # Create issue body
    body = f"""## {mod['title']}

**Category**: {mod['category']}  
**Reference**: `mobile/TINY_MODIFICATIONS.md` - Modification #{mod['number']}

### Description
{mod['description']}

### Files Affected
{mod['files']}

### Expected Benefit
{mod['benefit']}

### Estimated Time
⏱️ {mod['time']}

### Implementation Checklist
- [ ] Read full details in `mobile/TINY_MODIFICATIONS.md` (item #{mod['number']})
- [ ] Create focused PR with minimal changes
- [ ] Add tests if applicable
- [ ] Run `npm run lint` in mobile directory
- [ ] Test on device/emulator
- [ ] Update documentation if needed
- [ ] Link this issue to the PR

### Reference
See [mobile/TINY_MODIFICATIONS.md](../mobile/TINY_MODIFICATIONS.md) for complete details.
"""
    
    title = f"[Mobile] {mod['title']}"
    
    return {
        'title': title,
        'body': body,
        'labels': labels_str,
        'number': mod['number']
    }


def main():
    parser = argparse.ArgumentParser(description='Generate GitHub issues from TINY_MODIFICATIONS.md')
    parser.add_argument('--output-dir', default='./issues', help='Output directory for issue files')
    parser.add_argument('--dry-run', action='store_true', help='Print issues without creating files')
    parser.add_argument('--gh-create', action='store_true', help='Create issues directly using gh CLI')
    args = parser.parse_args()
    
    # Find TINY_MODIFICATIONS.md
    script_dir = Path(__file__).parent
    md_file = script_dir / 'TINY_MODIFICATIONS.md'
    
    if not md_file.exists():
        print(f"Error: {md_file} not found", file=sys.stderr)
        return 1
    
    print(f"Parsing {md_file}...")
    modifications = parse_modifications(md_file)
    print(f"Found {len(modifications)} modifications\n")
    
    if args.dry_run:
        # Just print the first few
        for mod in modifications[:5]:
            issue = format_issue(mod)
            print(f"\n{'=' * 80}")
            print(f"ISSUE #{mod['number']}: {issue['title']}")
            print(f"Labels: {issue['labels']}")
            print(f"{'=' * 80}")
            print(issue['body'])
        print(f"\n... and {len(modifications) - 5} more issues")
        return 0
    
    if args.gh_create:
        print("Creating issues using gh CLI...")
        for mod in modifications:
            issue = format_issue(mod)
            # Create a temporary file for the body
            import tempfile
            with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
                f.write(issue['body'])
                body_file = f.name
            
            try:
                cmd = f'gh issue create --title "{issue["title"]}" --body-file "{body_file}" --label "{issue["labels"]}"'
                print(f"Creating issue #{mod['number']}: {mod['title']}")
                os.system(cmd)
            finally:
                os.unlink(body_file)
        return 0
    
    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate issue files
    print(f"Generating issue files in {output_dir}...")
    for mod in modifications:
        issue = format_issue(mod)
        filename = f"issue-{mod['number']:03d}-{mod['title'].lower().replace(' ', '-')[:40]}.md"
        # Clean filename
        filename = re.sub(r'[^\w\-.]', '', filename)
        filepath = output_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"---\n")
            f.write(f"title: {issue['title']}\n")
            f.write(f"labels: {issue['labels']}\n")
            f.write(f"---\n\n")
            f.write(issue['body'])
        
        print(f"  Created: {filepath.name}")
    
    print(f"\n✅ Generated {len(modifications)} issue files in {output_dir}")
    print(f"\nTo create issues on GitHub, use:")
    print(f"  cd {output_dir}")
    print(f"  for file in *.md; do gh issue create --body-file $file; done")
    print(f"\nOr use: python3 generate-issues.py --gh-create")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
