const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
require('dotenv').config();  // Load environment variables
const app = express();
const port = 3000;
const cors = require('cors');  // Import CORS

app.use(cors());  

// Middleware to parse JSON requests
app.use(express.json());

// Set up file upload middleware
const upload = multer({ dest: 'uploads/' });

// API endpoint to handle PDF upload and question submission
app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file || !req.body.question) {
            return res.status(400).json({ error: "Please upload a PDF and provide a question." });
        }

        console.log("File received:", req.file);
        const pdfPath = req.file.path;

        // Extract text from the uploaded PDF
        const pdfBuffer = fs.readFileSync(pdfPath);
        const pdfData = await pdfParse(pdfBuffer);
        const pdfText = pdfData.text;

        // Log the full extracted text (or part of it)
        console.log("Extracted text from PDF:", pdfText.substring(0, 500)); // Log first 500 characters

        // Get the question from the client-side
        const question = req.body.question;

        console.log("Received question:", question);

        // Hugging Face API endpoint for question answering
        const apiUrl = 'https://api-inference.huggingface.co/models/deepset/roberta-base-squad2';
        const requestData = {
            inputs: {
                question: question,
                context: pdfText  // Pass the PDF text as the context
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        
        // Send the AI response back to the frontend
        if (data && data.answer) {
            res.json({ answer: data.answer });
        } else {
            res.json({ answer: "Sorry, I couldn't generate an answer." });
        }

        // Clean up the uploaded file
        fs.unlinkSync(pdfPath);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
