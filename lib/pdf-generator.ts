import jsPDF from 'jspdf'

export interface PDFOptions {
  title?: string
  author?: string
  subject?: string
  keywords?: string
}

export function generateScriptPDF(script: string, options: PDFOptions = {}): void {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Set document properties
  doc.setProperties({
    title: options.title || 'Manga Script',
    author: options.author || 'MangaNarrate',
    subject: options.subject || 'Generated Manga Script',
    keywords: options.keywords || 'manga, script, recap'
  })

  // Set font and styling
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxWidth = pageWidth - (margin * 2)
  const lineHeight = 7

  // Add title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(options.title || 'Manga Script', margin, margin + 10)

  // Add generation date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const date = new Date().toLocaleDateString()
  doc.text(`Generated on: ${date}`, margin, margin + 20)

  // Reset font for content
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')

  // Split script into lines and handle text wrapping
  let yPosition = margin + 35
  const lines = script.split('\n')

  for (const line of lines) {
    if (line.trim() === '') {
      // Empty line - add spacing
      yPosition += lineHeight / 2
      continue
    }

    // Check if this is a panel header (starts with **)
    if (line.startsWith('**') && line.endsWith('**')) {
      // Panel header styling
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      
      // Add some spacing before panel headers (except first one)
      if (yPosition > margin + 35) {
        yPosition += lineHeight
      }
      
      const headerText = line.replace(/\*\*/g, '')
      doc.text(headerText, margin, yPosition)
      yPosition += lineHeight + 2
      
      // Reset to normal font
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
    } else {
      // Regular content - handle text wrapping
      const wrappedLines = doc.splitTextToSize(line, maxWidth)
      
      for (const wrappedLine of wrappedLines) {
        // Check if we need a new page
        if (yPosition + lineHeight > pageHeight - margin) {
          doc.addPage()
          yPosition = margin + 10
        }
        
        doc.text(wrappedLine, margin, yPosition)
        yPosition += lineHeight
      }
    }

    // Check if we need a new page
    if (yPosition + lineHeight > pageHeight - margin) {
      doc.addPage()
      yPosition = margin + 10
    }
  }

  // Add footer with page numbers
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 30,
      pageHeight - 10
    )
    doc.text(
      'Generated by MangaNarrate',
      margin,
      pageHeight - 10
    )
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const filename = `manga-script-${timestamp}.pdf`

  // Save the PDF
  doc.save(filename)
}

export function generateScriptPDFWithImages(
  script: string, 
  images: Array<{ preview: string; file: File }>,
  options: PDFOptions = {}
): void {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Set document properties
  doc.setProperties({
    title: options.title || 'Manga Script with Images',
    author: options.author || 'MangaNarrate',
    subject: options.subject || 'Generated Manga Script with Panel Images',
    keywords: options.keywords || 'manga, script, recap, images'
  })

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxWidth = pageWidth - (margin * 2)
  const lineHeight = 7
  const imageWidth = 60
  const imageHeight = 80

  // Add title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(options.title || 'Manga Script with Images', margin, margin + 10)

  // Add generation date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const date = new Date().toLocaleDateString()
  doc.text(`Generated on: ${date}`, margin, margin + 20)

  let yPosition = margin + 35
  const lines = script.split('\n')
  let currentPanelIndex = 0

  for (const line of lines) {
    if (line.trim() === '') {
      yPosition += lineHeight / 2
      continue
    }

    // Check if this is a panel header
    if (line.startsWith('**Panel') && line.endsWith(':**')) {
      // Add new page for each panel (except first)
      if (currentPanelIndex > 0) {
        doc.addPage()
        yPosition = margin + 10
      }

      // Panel header
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      const headerText = line.replace(/\*\*/g, '').replace(':', '')
      doc.text(headerText, margin, yPosition)
      yPosition += lineHeight + 5

      // Add corresponding image if available
      if (currentPanelIndex < images.length) {
        try {
          const imageData = images[currentPanelIndex].preview
          doc.addImage(
          imageData,
          'JPEG',
          margin,
          yPosition,
          imageWidth,
          imageHeight
          )
          yPosition += imageHeight + 10
        } catch (error) {
          console.warn(`Could not add image for panel ${currentPanelIndex + 1}:`, error)
          yPosition += 10
        }
      }

      currentPanelIndex++
      
      // Reset font for content
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
    } else {
      // Regular content
      const wrappedLines = doc.splitTextToSize(line, maxWidth)
      
      for (const wrappedLine of wrappedLines) {
        if (yPosition + lineHeight > pageHeight - margin) {
          doc.addPage()
          yPosition = margin + 10
        }
        
        doc.text(wrappedLine, margin, yPosition)
        yPosition += lineHeight
      }
    }
  }

  // Add footer with page numbers
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 30,
      pageHeight - 10
    )
    doc.text(
      'Generated by MangaNarrate',
      margin,
      pageHeight - 10
    )
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const filename = `manga-script-with-images-${timestamp}.pdf`
  // Save the PDF
  doc.save(filename)
}
