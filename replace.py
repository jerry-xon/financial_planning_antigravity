import re
import os

def replace_in_file(filepath):
    if not os.path.exists(filepath):
        print(f"File {filepath} not found.")
        return
        
    content = open(filepath, 'r', encoding='utf-8').read()
    content = re.sub(r'<input\s+type="number"(.*?)/\s*>', r'<CurrencyInput\1/>', content, flags=re.DOTALL)
    content = content.replace('onWheel={(e) => e.target.blur()} ', '')
    content = content.replace('onWheel={(e) => e.target.blur()}', '')
    open(filepath, 'w', encoding='utf-8').write(content)

replace_in_file('src/components/CashFlowModule/CashFlowInput.jsx')
replace_in_file('src/components/AssetModule/AssetInput.jsx')
