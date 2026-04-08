import fitz
doc = fitz.open('vercel plan 2.pdf')
text = ''
for page in doc:
    text += page.get_text() + '\n'
with open('extracted_pdf.txt', 'w', encoding='utf-8') as f:
    f.write(text)
