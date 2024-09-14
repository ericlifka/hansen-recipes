const fs = require('fs');
const pdf = require('pdf-parse');

const pdfFilePath = 'recipes.pdf';
const txtFilePath = 'output.txt';

let dataBuffer = fs.readFileSync(pdfFilePath);

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync(txtFilePath, data.text);
    console.log("PDF converted to TXT successfully. Output saved to " + txtFilePath);
}).catch(function(err) {
    console.error("Error converting PDF to TXT:", err);
});