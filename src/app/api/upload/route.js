import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const fileName = file.name.toLowerCase();
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        console.log('[Upload] Processing file:', fileName, 'Size:', buffer.length, 'bytes');

        // Handle .txt files directly
        if (fileName.endsWith('.txt')) {
            const text = buffer.toString('utf-8');
            console.log('[Upload] TXT extracted, length:', text.trim().length);
            return NextResponse.json({ text: text.trim() });
        }

        // Handle .pdf files using pdf-parse
        if (fileName.endsWith('.pdf')) {
            try {
                const pdfParse = (await import('pdf-parse')).default;
                const pdfData = await pdfParse(buffer);
                const text = pdfData.text || '';
                console.log('[Upload] PDF extracted, length:', text.trim().length);

                if (text.trim().length > 10) {
                    return NextResponse.json({ text: text.trim() });
                }
                return NextResponse.json(
                    { error: 'Could not extract text from this PDF. It may be a scanned/image-based PDF. Please paste your resume text manually.' },
                    { status: 422 }
                );
            } catch (pdfErr) {
                console.error('[Upload] PDF parse error:', pdfErr.message);
                return NextResponse.json(
                    { error: 'Failed to read PDF file. Please paste your resume text manually.' },
                    { status: 422 }
                );
            }
        }

        // Handle .docx files — DOCX is a ZIP containing XML
        if (fileName.endsWith('.docx')) {
            try {
                const text = extractTextFromDocx(buffer);
                console.log('[Upload] DOCX extracted, length:', text.trim().length);

                if (text && text.trim().length > 10) {
                    return NextResponse.json({ text: text.trim() });
                }
                return NextResponse.json(
                    { error: 'Could not extract text from this DOCX. Please paste your resume text manually.' },
                    { status: 422 }
                );
            } catch (docxErr) {
                console.error('[Upload] DOCX parse error:', docxErr.message);
                return NextResponse.json(
                    { error: 'Failed to read DOCX file. Please paste your resume text manually.' },
                    { status: 422 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.' },
            { status: 400 }
        );
    } catch (error) {
        console.error('[Upload API] Error:', error.message);
        return NextResponse.json(
            { error: 'Failed to process file. Please paste your resume text manually.' },
            { status: 500 }
        );
    }
}

// DOCX text extractor — DOCX is a ZIP file containing word/document.xml
function extractTextFromDocx(buffer) {
    const raw = buffer.toString('utf-8');
    const textContent = raw
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
    return textContent;
}
