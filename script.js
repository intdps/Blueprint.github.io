document.getElementById('addRowButton').addEventListener('click', function () {
    const newRowContainer = document.createElement('div');
    newRowContainer.className = 'row';
  
    const columns = [
      { label: 'Question Type:', content: '<div contenteditable="true" class="editableDiv"></div>' },
      { label: 'No. of Questions:', content: '<input type="number">' },
      { label: 'Marks per Question:', content: '<input type="number">' },
      { label: 'Total Marks:', content: '<input type="number">' }
    ];
  
    columns.forEach(column => {
      const colDiv = document.createElement('div');
      colDiv.className = 'column';
  
      const label = document.createElement('label');
      label.innerHTML = column.label;
  
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = column.content;
  
      colDiv.appendChild(label);
      colDiv.appendChild(contentDiv);
      newRowContainer.appendChild(colDiv);
    });
  
    document.getElementById('newRowsContainer').appendChild(newRowContainer);
  });
  
  
  
  async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
  
    const imageUrl = 'https://i.imgur.com/WsGYCK6.jpg';
  
    // Load the image
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Tackle CORS
    img.src = imageUrl;
  
    img.onload = function () {
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (img.height * pdfWidth) / img.width; // calculate the height to maintain aspect ratio
  
      // Add the image to the PDF stretched across the width and starting at 4px from the top
      pdf.addImage(img, 'JPEG', 0, 4, pdfWidth, imgHeight);
  
      // Set the position where the first row would be
      const rowYPosition = 4 + imgHeight + 5 ;  // Adjusted to display below the image
  
      // Add the selected exam text to the first row
      const selectedExam = document.getElementById('examSelect').options[document.getElementById('examSelect').selectedIndex].text.toUpperCase();
  
      pdf.setFont("times", 'bold');  // Set font to Times Roman and bold
      pdf.setFontSize(25);  // Set font size to 20
      // Set the font color to dark grey (RGB: 100, 100, 100)
      pdf.setTextColor(50, 50, 50);
  
      // Calculate the center position for the text in the first row
      const examTextSize = pdf.getTextWidth(selectedExam);
      const examTextXPosition = (pdfWidth - examTextSize) / 2;
      pdf.text(selectedExam, examTextXPosition, rowYPosition + 8);  // Adjusted to display text centered inside the row
  
      pdf.setFont("times");  // Set font to Times Roman and bold
      pdf.setFontSize(15);  // Set font size to 20
  
      // Set the position where the second row would be (directly below the first row)
      const secondRowYPosition = rowYPosition + 10;
  
      // Add the selected session text to the second row
      const selectedSession = document.getElementById('sessionSelect').options[document.getElementById('sessionSelect').selectedIndex].text.toUpperCase();
      const sessionTextSize = pdf.getTextWidth(selectedSession);
      const sessionTextXPosition = (pdfWidth - sessionTextSize) / 2;
      pdf.text(selectedSession, sessionTextXPosition, secondRowYPosition + 8);  // Adjusted to display text centered inside the second row
  
      pdf.setFont("times");  // Set font to Times Roman and bold
      pdf.setFontSize(15);  // Set font size to 20
      
      // Set the position where the third row would be (directly below the second row)
      const thirdRowYPosition = secondRowYPosition + 10;
  
      // Add the selected subject text to the third row
      const selectedSubject = document.getElementById('subjectSelect').options[document.getElementById('subjectSelect').selectedIndex].text.toUpperCase();
      const subjectTextSize = pdf.getTextWidth(selectedSubject);
      const subjectTextXPosition = (pdfWidth - subjectTextSize) / 2;
      pdf.text(selectedSubject, subjectTextXPosition, thirdRowYPosition + 8);  // Adjusted to display text centered inside the third row
  
      // Set the position where the fourth row would be (directly below the third row)
      const fourthRowYPosition = thirdRowYPosition + 20;
  
      // Add the selected duration and max marks to the fourth row in two columns
      const selectedDuration = document.getElementById('durationSelect').value;
      const selectedMaxMarks = document.getElementById('maxMarksSelect').value;
      pdf.text(selectedDuration, 10, fourthRowYPosition + 8);  // Left column
      pdf.text(selectedMaxMarks, pdfWidth - 10 - pdf.getTextWidth(selectedMaxMarks), fourthRowYPosition + 8);  // Right column
  
      // Set the position where the "GENERAL INSTRUCTIONS" heading would be (directly below the fourth row)
      const generalInstructionsHeadingYPosition = fourthRowYPosition + 20; // Adjusted to make more space for the line and margin
  
      // Set margins for the line
      const leftLineMargin = 10;
      const rightLineMargin = 10;
  
      // Draw the line above "GENERAL INSTRUCTIONS"
      pdf.line(leftLineMargin, generalInstructionsHeadingYPosition - 10, pdfWidth - rightLineMargin, generalInstructionsHeadingYPosition - 10);
  
      // Set the font to bold and size to 20
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(20);
  
      // Add the "GENERAL INSTRUCTIONS" heading (left-aligned)
      const leftMargin = 10;  // Adjust this if you want more/less spacing from the left edge
      pdf.text("GENERAL INSTRUCTIONS", leftMargin, generalInstructionsHeadingYPosition);
  
      // Reset the font size and style
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(13);
  
  
  
      // Fetch the text from the "General Instructions" editable div
      const generalInstructions = document.getElementById('instructionsDiv').innerText;
  
      // Split the text so that it fits within the width of the PDF
      const wrappedInstructions = pdf.splitTextToSize(generalInstructions, pdfWidth - 20);
  
      // Calculate the available space on the first page
      const fifthRowYPosition = fourthRowYPosition + 20;
      const spaceRemaining = pdfHeight - fifthRowYPosition - 10;
      const lineHeight = 7;  // Approximate line height
      const linesFit = Math.floor(spaceRemaining / lineHeight);
  
      // Split the wrappedInstructions into two parts: what fits on the first page and what goes to the subsequent pages
      const firstPageText = wrappedInstructions.slice(0, linesFit);
      let remainingText = wrappedInstructions.slice(linesFit);
  
      // Add the text that fits on the first page
      pdf.text(firstPageText, 10, fifthRowYPosition + 8);
  
      // Continue to add the remaining text on new pages until all content has been printed
      let currentYPosition = fifthRowYPosition + 8 + firstPageText.length * lineHeight;
      while (remainingText.length > 0) {
        pdf.addPage();
        currentYPosition = 10;  // Reset Y position for new page
  
        // Calculate how many lines fit on a full page
        const fullPageLines = Math.floor(pdfHeight / lineHeight);
  
        // Split the remaining text again: what fits on this new page and what goes to the next
        const currentPageText = remainingText.slice(0, fullPageLines);
        remainingText = remainingText.slice(fullPageLines);
  
        // Add the text for the current page
        pdf.text(currentPageText, 10, currentYPosition);
        currentYPosition += currentPageText.length * lineHeight;
      }
  
      // Fetch the selected text from the "Class" dropdown and convert to uppercase
      const selectedClass = document.getElementById('classSelect').value.toUpperCase();
  
      // Set font to bold
      pdf.setFont(undefined, 'bold');
      // Set the font size to 20
      pdf.setFontSize(15);
  
      // Calculate the x-coordinate to center the text
      const textWidth = pdf.getTextWidth(selectedClass);
      const centeredX = (pdfWidth - textWidth) / 2;
  
      // Check if the class dropdown content will fit on the current page
      if (currentYPosition + 10 > pdf.internal.pageSize.getHeight()) {
        pdf.addPage();
        currentYPosition = 10;  // Reset Y position for new page
      }
  
      // Add the "Class" content
      pdf.text(selectedClass, centeredX, currentYPosition);
      currentYPosition += 10;
  
      // Check if the "BLUEPRINT" row will fit on the current page
      if (currentYPosition + 20 > pdf.internal.pageSize.getHeight()) {
        pdf.addPage();
        currentYPosition = 10;  // Reset Y position for new page
      }
      // Set font to bold
      pdf.setFont(undefined, 'bold');
      // Set the font size to 20
      pdf.setFontSize(22);
  
      // Add the "BLUEPRINT" text
      const blueprintText = "BLUEPRINT";
      const blueprintTextWidth = pdf.getTextWidth(blueprintText);
      const blueprintCenteredX = (pdfWidth - blueprintTextWidth) / 2;
      pdf.text(blueprintText, blueprintCenteredX, currentYPosition);
  
      // Set the position for the new row after the "BLUEPRINT" row
      let newRowYPosition = currentYPosition + 10;
  
      // Reduce the font size for the new row
      pdf.setFontSize(13);
  
      // Define margins and adjust column width
      const marginLeft = 8;
      const marginRight = 8;
      const columnWidth = (pdfWidth - marginLeft - marginRight) / 4;
  
      // Set the widths for the columns
      const columnWidths = [47, 48, 58, 41];
  
      // Set font to bold for the dynamically added rows
      pdf.setFont(undefined, 'bold');
  
      // Add the four columns (for the static row with headings)
      const headings = ["QUESTION TYPE", "NO. OF QUESTIONS", "MARKS PER QUESTION", "TOTAL MARKS"];
      for (let i = 0; i < 4; i++) {
        // Draw the green background for the column
        pdf.setFillColor(100, 200, 100);  // RGB for green
        pdf.rect(marginLeft + (columnWidths.slice(0, i).reduce((a, b) => a + b, 0)), newRowYPosition - 4, columnWidths[i], 10, 'F');  // 'F' means filled rectangle
  
        // Explicitly set the text color to black
        pdf.setTextColor(255, 255, 255);  // RGB for black
  
        const heading = headings[i];
        const headingWidth = pdf.getTextWidth(heading);
        const centeredX = marginLeft + (columnWidths.slice(0, i).reduce((a, b) => a + b, 0)) + (columnWidths[i] - headingWidth) / 2;
  
        // For vertical centering
        const cellMiddleY = newRowYPosition + 2;  // Adjusted based on cell height and font size
  
        pdf.text(heading, centeredX, cellMiddleY);
  
        // Set the stroke color to white for drawing the vertical lines (inline borders)
        pdf.setDrawColor(255, 255, 255);  // RGB for white
        if (i > 0) {
          pdf.line(marginLeft + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), newRowYPosition - 4, marginLeft + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), newRowYPosition + 6);
        }
      }
  
      // Draw the outer border of the row
      pdf.setDrawColor(255, 255, 255);  // RGB for black
      pdf.rect(marginLeft, newRowYPosition - 4, columnWidths.reduce((a, b) => a + b, 0), 10);
  
      // Move to the next row
      const newRowStartYPosition = newRowYPosition + 11;
      currentYPosition = newRowStartYPosition;
  
      // Get the rows to be added
      const newRows = document.getElementById('newRowsContainer').children;
  
      // Explicitly set the text color to black for the dynamically added rows
      pdf.setTextColor(0, 0, 0);  // RGB for black
  
  
  
  
   
      // For dynamically added rows:
  
    
  
  
  
      for (let row of newRows) {
        // Set font to bold for the dynamically added rows
        pdf.setFont(undefined, 'bold');
  
        // Extract data from the fields in the row
        let questionType = row.children[0].querySelector('.editableDiv').innerText;
        let numOfQuestions = row.children[1].querySelector('input').value;
        let marksPerQuestion = row.children[2].querySelector('input').value;
        let totalMarks = row.children[3].querySelector('input').value;
  
        // Split the Question Type text to make sure it doesn't exceed its column width
        const questionTypeLines = pdf.splitTextToSize(questionType, columnWidths[0] - 10);
  
        if (currentYPosition + (10 * questionTypeLines.length) > pdf.internal.pageSize.getHeight()) {
          pdf.addPage();
          currentYPosition = 10;  // Start at the top with a 10px margin
        }
  
        // Draw the light blue background for the row
        const rowHeight = 10 + (7 * (questionTypeLines.length - 1));
        pdf.setFillColor(240, 240, 240);  // RGB for light blue
        pdf.rect(marginLeft, currentYPosition - 5, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
  
        // Render the extracted data on the PDF
  
        // Question Type (Left Aligned)
        let questionTypeYPosition = currentYPosition;
        for (let line of questionTypeLines) {
          pdf.text(line, marginLeft + 5, questionTypeYPosition);
          questionTypeYPosition += 7;  // Increment by approximate line height for multi-line content
        }
  
        // Center-align for the rest of the columns
        pdf.text(numOfQuestions, marginLeft + columnWidths[0] + (columnWidths[1] - pdf.getTextWidth(numOfQuestions)) / 2, currentYPosition);
        pdf.text(marksPerQuestion, marginLeft + columnWidths[0] + columnWidths[1] + (columnWidths[2] - pdf.getTextWidth(marksPerQuestion)) / 2, currentYPosition);
        pdf.text(totalMarks, marginLeft + columnWidths[0] + columnWidths[1] + columnWidths[2] + (columnWidths[3] - pdf.getTextWidth(totalMarks)) / 2, currentYPosition);
  
        // Draw the borders
        pdf.setDrawColor(255, 255, 255);  // RGB for black
  
        // Draw vertical lines between columns
        for (let i = 0; i <= 4; i++) {
          pdf.line(marginLeft + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), currentYPosition - 5, marginLeft + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), currentYPosition + 5 + (7 * (questionTypeLines.length - 1)));
        }
  
        // Draw horizontal lines for the top and bottom of the row
        pdf.line(marginLeft, currentYPosition - 5, marginLeft + columnWidths.reduce((a, b) => a + b, 0), currentYPosition - 5);  // Top line
        pdf.line(marginLeft, currentYPosition + 5 + (7 * (questionTypeLines.length - 1)), marginLeft + columnWidths.reduce((a, b) => a + b, 0), currentYPosition + 5 + (7 * (questionTypeLines.length - 1)));  // Bottom line
  
        // Adjust Y position for the next dynamically added row
        currentYPosition = questionTypeYPosition + 1;  // Adjusted to account for multi-line content in the first column
      }
  
      pdf.setFont(undefined, 'normal');
  
  
  
  
  
  
  
  
      pdf.save('generated.pdf');
    }
  }
  