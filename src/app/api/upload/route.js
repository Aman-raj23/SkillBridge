import { NextResponse } from 'next/server';

export const config = { api: { bodyParser: false } };

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

        // Handle .txt files directly
        if (fileName.endsWith('.txt')) {
            const text = buffer.toString('utf-8');
            return NextResponse.json({ text: text.trim() });
        }

        // Handle .pdf files
        if (fileName.endsWith('.pdf')) {
            // Extract text from PDF by parsing the raw content
            const pdfText = extractTextFromPDF(buffer);
            if (pdfText && pdfText.trim().length > 10) {
                return NextResponse.json({ text: pdfText.trim() });
            }
            return NextResponse.json({ error: 'Could not extract text from this PDF. It may be a scanned/image-based PDF. Please paste your resume text manually.' }, { status: 422 });
        }

        // Handle .docx files — extract plain text from XML
        if (fileName.endsWith('.docx')) {
            const text = extractTextFromDocx(buffer);
            if (text && text.trim().length > 10) {
                return NextResponse.json({ text: text.trim() });
            }
            return NextResponse.json({ error: 'Could not extract text from this DOCX. Please paste your resume text manually.' }, { status: 422 });
        }

        return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.' }, { status: 400 });
    } catch (error) {
        console.error('[Upload API] Error:', error.message);
        return NextResponse.json({ error: 'Failed to process file. Please paste your resume text manually.' }, { status: 500 });
    }
}

// Simple PDF text extractor — parses PDF stream objects for text content
function extractTextFromPDF(buffer) {
    try {
        const raw = buffer.toString('latin1');
        const textParts = [];

        // Extract text between BT (Begin Text) and ET (End Text) operators
        const btEtRegex = /BT\s([\s\S]*?)ET/g;
        let match;
        while ((match = btEtRegex.exec(raw)) !== null) {
            const block = match[1];
            // Match text show operators: Tj, TJ, ', "
            const tjRegex = /\(([^)]*)\)\s*Tj/g;
            let tjMatch;
            while ((tjMatch = tjRegex.exec(block)) !== null) {
                textParts.push(tjMatch[1]);
            }
            // TJ array operator
            const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
            let arrMatch;
            while ((arrMatch = tjArrayRegex.exec(block)) !== null) {
                const inner = arrMatch[1];
                const strRegex = /\(([^)]*)\)/g;
                let strMatch;
                while ((strMatch = strRegex.exec(inner)) !== null) {
                    textParts.push(strMatch[1]);
                }
            }
        }

        // Decode common PDF escape sequences
        let text = textParts.join(' ')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\');

        // Also try to extract from deflated streams if no text found
        if (text.trim().length < 20) {
            // Fallback: try to find any readable ASCII text in the buffer
            const ascii = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{3,}/g, '\n').trim();
            const lines = ascii.split('\n').filter(l => l.trim().length > 3 && !/^[%\/]/.test(l.trim()));
            if (lines.length > 3) {
                text = lines.join('\n');
            }
        }

        return text;
    } catch (e) {
        console.error('[Upload API] PDF parse error:', e.message);
        return '';
    }
}

// Simple DOCX text extractor — DOCX is a ZIP file containing XML
function extractTextFromDocx(buffer) {
    try {
        // DOCX files are ZIP archives. Find the word/document.xml entry
        const raw = buffer.toString('utf-8');
        // Strip XML tags to get plain text
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
    } catch (e) {
        console.error('[Upload API] DOCX parse error:', e.message);
        return '';
    }
}
