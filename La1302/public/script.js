function changeTemplate() {
    var templateSelector = document.getElementById("template-selector");
    var memeImage = document.getElementById("meme-image");
    var selectedTemplate = templateSelector.value;
    var templatePath = "templates/" + selectedTemplate + ".png";
    memeImage.src = templatePath;
}

function addTextBox() {
    var memeContainer = document.getElementById('meme-container');
    var newTextBox = document.createElement('div');
    newTextBox.contentEditable = true;
    newTextBox.classList.add('text-overlay');
    newTextBox.style.position = 'absolute';
    newTextBox.style.left = '50%';
    newTextBox.style.top = '50%';
    newTextBox.style.transform = 'translate(-50%, -50%)';
    newTextBox.style.color = 'white';
    newTextBox.style.textAlign = 'center';
    newTextBox.style.fontSize = '30px';
    newTextBox.style.textShadow = '2px 2px 4px #000000';
    newTextBox.style.border = '1px dashed #ffffff';
    newTextBox.style.padding = '5px';
    newTextBox.style.cursor = 'move';
    newTextBox.style.resize = 'both';
    newTextBox.style.overflow = 'auto';

    newTextBox.addEventListener('mousedown', function(e) {
        startDrag(e, newTextBox);
    });

    memeContainer.appendChild(newTextBox);
}

function startDrag(e, element) {
    var startX = e.clientX;
    var startY = e.clientY;
    var initialX = element.offsetLeft;
    var initialY = element.offsetTop;

    function drag(e) {
        var deltaX = e.clientX - startX;
        var deltaY = e.clientY - startY;
        element.style.left = initialX + deltaX + 'px';
        element.style.top = initialY + deltaY + 'px';
    }

    function stopDrag() {
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

window.onload = function() {
    document.getElementById('template-selector').value = 'memeTemp0';
    changeTemplate();
};

document.getElementById('add-textbox-button').addEventListener('click', addTextBox);
document.getElementById('upload-btn').addEventListener('click', function() {
    var uploadContainer = document.getElementById('upload-container');
    uploadContainer.hidden = !uploadContainer.hidden;
});

function handleFiles(files) {
    if(files.length) {
        var img = document.getElementById('meme-image');
        img.src = URL.createObjectURL(files[0]); // Set the uploaded image as the meme image
        img.onload = function() {
            URL.revokeObjectURL(img.src); // Free up memory
        };
    }
}

// Drag and Drop functionality
var dropArea = document.getElementById('drop-area');

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
});

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
});

;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
});

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    var dt = e.dataTransfer;
    var files = dt.files;

    handleFiles(files);
}
document.getElementById('download-btn').addEventListener('click', function() {
    var canvas = document.getElementById('meme-canvas');
    var ctx = canvas.getContext('2d');
    var img = document.getElementById('meme-image');

    // Adjust the canvas size to match the image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw each text overlay
    var textOverlays = document.querySelectorAll('.text-overlay');
    textOverlays.forEach(function(textOverlay) {
        var style = window.getComputedStyle(textOverlay);

        // Extracting font size and color from the text overlay style
        var fontSize = parseInt(style.fontSize);
        var fontColor = style.color;
        ctx.font = fontSize + 'px sans-serif';
        ctx.fillStyle = fontColor;
        ctx.textAlign = 'left';

        // Calculate position relative to the canvas
        var rect = textOverlay.getBoundingClientRect();
        var offsetX = (rect.left - img.getBoundingClientRect().left) * (canvas.width / img.width);
        var offsetY = (rect.top - img.getBoundingClientRect().top) * (canvas.height / img.height);

        // Adjust Y position based on font size (to align top-left of text)
        offsetY += fontSize;

        // Drawing the text onto the canvas
        ctx.fillText(textOverlay.innerText, offsetX, offsetY);
    });

    // Create and trigger a download link
    var link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
