async function submitQuestion(event) {
    event.preventDefault(); // Prevent form submission

    const pdfInput = document.getElementById('pdf-upload').files[0];
    const questionInput = document.getElementById('question-input').value;

    if (!pdfInput || !questionInput.trim()) {
        alert("Please upload a PDF and ask a question!");
        return;
    }

    const formData = new FormData();
    formData.append('pdf', pdfInput);
    formData.append('question', questionInput);

    // Show "Generating answer..." while waiting for response
    document.getElementById('answer-output').innerHTML = "Generating answer...";

    try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Server responded with an error.");
        }

        const data = await response.json();
        console.log("Response Data:", data); // Log the response data

        // Display the answer from the server
        if (data.answer) {
            document.getElementById('answer-output').innerHTML = data.answer;
        } else {
            document.getElementById('answer-output').innerHTML = "Sorry, I couldn't generate an answer.";
        }

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('answer-output').innerHTML = "An error occurred. Please try again.";
    }
}
