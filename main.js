function OpenaiImageEditAPI() {
  console.log("Submit button clicked");
  const fileInput = document.getElementById('image');
  const file = fileInput.files[0];

  if (!file) {
      alert('Please upload a PNG image.');
      console.log("No file uploaded");
      return;
  }

  console.log("File selected:", file);

  const formData = new FormData();
  formData.append('image', file);
  formData.append('prompt', "Change the background of the uploaded image to red and add a random superhero symbol to the person's chest");
  formData.append('size', '1024x1024');

  fetch('http://localhost:3000/openai/edit', {
      method: 'POST',
      body: formData
  }).then(response => {
      console.log('Response status:', response.status);
      if (!response.ok) {
          return response.json().then(error => {
              throw new Error(`Network response was not ok: ${error.message}`);
          });
      }
      return response.json();
  }).then(data => {
      console.log('Response data:', data);
      const imageUrl = data.data[0].url;
      const imageContainer = document.getElementById('imageContainer');
      imageContainer.innerHTML = `<img src="${imageUrl}" alt="Edited Image" style="max-width: 100%; height: auto;" />`;
  }).catch(error => {
      console.log('Something bad happened', error);
      alert(`Error: ${error.message}`);
  });
}
