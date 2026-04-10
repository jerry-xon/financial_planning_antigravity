import os
import glob
import re

directory = 'c:/financial_planning_antigravity/src/components'
pattern = os.path.join(directory, '**/*.jsx')

fixes_applied = 0
for file_path in glob.glob(pattern, recursive=True):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace literal \` with `
    new_content = content.replace(r'\`', '`')
    # Replace literal \${ with ${
    new_content = new_content.replace(r'\${', '${')
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        fixes_applied += 1
        print(f"Fixed {file_path}")

print(f"Done. Total files fixed: {fixes_applied}")
