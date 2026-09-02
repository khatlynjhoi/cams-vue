export function exportToPDF(title, examItems, includeAnswerKey = false) {
  const printWindow = window.open('', '_blank')

  const itemsHtml = examItems.map((item, idx) => `
    <div style="margin-bottom: 18px; font-family: sans-serif; font-size: 12px;">
      <div style="font-weight: bold; color: #1e293b;">
        ${idx + 1}. ${item.text}
        <span style="font-size: 10px; font-weight: normal; color: #64748b;">(${item.bloomLevel})</span>
      </div>
      ${item.options && item.options.length ? `
        <div style="margin-left: 20px; margin-top: 6px;">
          ${item.options.map((opt, i) => `
            <div style="margin-bottom: 3px;">
              <strong>${String.fromCharCode(65 + i)}.</strong> ${opt}
              ${includeAnswerKey && item.correctAnswer.includes(i) ? '<strong style="color: #059669;"> [CORRECT]</strong>' : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `).join('')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #0f172a; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { font-size: 16px; margin: 0; text-transform: uppercase; }
          .header h2 { font-size: 12px; margin: 4px 0 0 0; color: #475569; }
          .meta { display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-bottom: 20px; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Maritime Academy Assessment Engine</h1>
          <h2>${title} ${includeAnswerKey ? '- INSTRUCTOR ANSWER KEY' : ''}</h2>
        </div>
        <div class="meta">
          <div>Cadet Name: _______________________</div>
          <div>Date: __________________</div>
          <div>STCW Ref: Table A-II/1</div>
        </div>
        ${itemsHtml}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 500)
}