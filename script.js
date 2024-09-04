document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file first');
        return;
    }

    const formData = new FormData();
    formData.append('audio', file);

    // Show the loader
    document.getElementById('loader').style.display = 'block';

    try {
        const response = await fetch('http://localhost:8081/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Network response was not ok');
        }

        const data = await response.json();
        document.getElementById('transcription').innerText = data.transcription;
        document.getElementById('translation').innerText = data.translation;
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing file: ' + error.message);
    } finally {
        // Hide the loader
        document.getElementById('loader').style.display = 'none';
    }
});
