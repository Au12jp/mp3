// main.ts
const worker = new Worker("./core-mt/worker.js");

// HTML elements
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const trimButton = document.getElementById("trimButton") as HTMLButtonElement;
const videoOutput = document.getElementById("videoOutput") as HTMLVideoElement;

// Add event listener for button click
trimButton.addEventListener("click", () => {
  if (!fileInput.files || fileInput.files.length === 0) {
    alert("Please select a video file first.");
    return;
  }

  const start = (document.getElementById("start") as HTMLInputElement).value;
  const end = (document.getElementById("end") as HTMLInputElement).value;
  const file = fileInput.files[0];

  // Send the data to the worker for processing
  worker.postMessage({
    command: "trim",
    file: file,
    startTime: start,
    endTime: end,
  });
});

// Handle messages from the worker
worker.onmessage = (event) => {
  const { trimmedVideoUrl } = event.data;
  videoOutput.src = trimmedVideoUrl; // Set the trimmed video for preview
};
