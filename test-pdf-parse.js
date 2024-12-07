const fs = require('fs');
const pdfParse = require('pdf-parse');

(async () => {
    try {
        const pdfBuffer = fs.readFileSync('./sample.pdf'); // Update with the correct path
        const pdfData = await pdfParse(pdfBuffer);
        console.log("Extracted Text:", pdfData.text);
    } catch (error) {
        console.error("Error parsing PDF:", error);
    }
})();
