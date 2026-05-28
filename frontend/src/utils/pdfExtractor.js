/**
 * pdfExtractor.js
 * Extracts text from a PDF File object using PDF.js (loaded from CDN).
 * Returns the first ~6000 characters of combined page text.
 */

let pdfJsLoaded = false

async function loadPdfJs() {
  if (pdfJsLoaded || window.pdfjsLib) {
    pdfJsLoaded = true
    return
  }
  await new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      pdfJsLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'))
    document.head.appendChild(script)
  })
}

/**
 * @param {File} file  - A PDF File object from an <input type="file">
 * @returns {Promise<string>} Extracted text (max 6000 chars)
 */
export async function extractTextFromPDF(file) {
  await loadPdfJs()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise

  const maxPages = Math.min(pdf.numPages, 10) // read up to 10 pages
  let fullText = ''

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }

  return fullText.trim().slice(0, 6000)
}
