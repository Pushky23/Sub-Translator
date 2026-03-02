document
  .getElementById("subtitleFile")
  .addEventListener("change", handleFileUpload);

let subtitles = [];
let fileContent = "";

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    console.log("File selected:", file.name); // Debugging
    const reader = new FileReader();
    reader.onload = function (e) {
      fileContent = e.target.result;
      console.log("File content loaded:", fileContent.slice(0, 200)); // Debugging (show first 200 characters)
    };
    reader.readAsText(file);
  } else {
    console.error("No file selected"); // Debugging
  }
}

function parseSRT(data) {
  const srtRegex =
    /(\d+)\r?\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\r?\n([\s\S]*?)(?=\r?\n\r?\n|\r?\n\d+\r?\n|\r?\n*$)/g;
  let matches;
  let result = [];

  while ((matches = srtRegex.exec(data)) !== null) {
    console.log("Match found:", matches); // Debugging
    result.push({
      index: matches[1],
      startTime: matches[2],
      endTime: matches[3],
      text: matches[4].trim().replace(/\r?\n/g, " "),
    });
  }

  return result;
}

async function translateText(text, targetLang) {
  try {
    console.log("Sending text for translation:", text); // Debugging
    const response = await fetch("http://localhost:3000/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        target_lang: targetLang,
      }),
    });

    const data = await response.json();
    console.log("Translation response:", data); // Debugging

    if (data.translations && data.translations.length > 0) {
      return data.translations[0].text;
    } else {
      console.error("Translation failed:", data); // Debugging
      return text; // Return original text if translation fails
    }
  } catch (error) {
    console.error("Translation error:", error); // Debugging
    return text; // Return original text if translation fails
  }
}

async function translateSubtitles() {
  if (!fileContent) {
    console.error("File content is empty");
    return;
  }

  const targetLang = document.getElementById("languageSelect").value;
  subtitles = parseSRT(fileContent);
  console.log("Parsed subtitles:", subtitles); // Debugging

  const translatedSubtitles = [];
  for (let subtitle of subtitles) {
    const translatedText = await translateText(subtitle.text, targetLang);
    console.log("Translated text:", translatedText); // Debugging
    translatedSubtitles.push({
      index: subtitle.index,
      startTime: subtitle.startTime,
      endTime: subtitle.endTime,
      text: translatedText,
    });
  }

  console.log("Translated subtitles:", translatedSubtitles); // Debugging
  generateSRTFile(translatedSubtitles);
}

function generateSRTFile(translatedSubtitles) {
  let srtContent = "";

  for (let subtitle of translatedSubtitles) {
    srtContent += `${subtitle.index}\n`;
    srtContent += `${subtitle.startTime} --> ${subtitle.endTime}\n`;
    srtContent += `${subtitle.text}\n\n`;
  }

  console.log("Generated SRT content:", srtContent); // Debugging

  const blob = new Blob([srtContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.getElementById("downloadLink");
  downloadLink.href = url;
  downloadLink.download = "translated_subtitles.srt";
  downloadLink.style.display = "block";
  downloadLink.textContent = "Download Translated File";
}
