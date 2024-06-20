import express from 'express';
import fetch from 'node-fetch';
import helmet from 'helmet';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import FormData from 'form-data';

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' }); // Directory for temporary storage of uploaded files

// Use Helmet to set security-related HTTP headers
app.use(helmet());

// Use CORS to allow requests from different origins
app.use(cors({
    origin: 'http://localhost:5173', // Replace with the origin of your Vite dev server
}));

// Custom CSP to allow scripts from the blob URL and localhost
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' blob:; connect-src 'self' https://api.openai.com;"
    );
    next();
});

app.use(express.json());
app.use(express.static('public'));

app.post('/openai/edit', upload.single('image'), async (req, res) => {
    const { path, originalname } = req.file;
    const { prompt, size } = req.body;

    console.log('Received file:', originalname);
    console.log('File path:', path);

    const url = 'https://api.openai.com/v1/images/edits';
    const bearer = 'Bearer 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'; // Replace with your actual OpenAI API key

    try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(path), originalname);
        formData.append('prompt', prompt);
        formData.append('size', size);
        formData.append('model', 'dall-e-2'); // Specify the model as DALL-E 2
        formData.append('n', 1); // Ensure generating one image
        formData.append('response_format', 'url'); // Ensure response format is URL

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: bearer,
            },
            body: formData
        });

        const data = await response.json();
        console.log('Response from OpenAI:', data);

        // Clean up the uploaded file
        fs.unlinkSync(path);

        if (response.ok) {
            res.json(data);
        } else {
            res.status(response.status).json(data);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Something bad happened: ' + error);
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
