function parseUserInput(input) { 
  const tasks = [];

  // Match "Go to" command (navigate to a website)
  const goToMatch = input.match(/go to\s+(https?:\/\/\S+|\S+)\s*,?/i); 
  if (goToMatch) {
      const url = goToMatch[1].startsWith('http') 
          ? goToMatch[1].trim().replace(/,$/, '') 
          : `https://${goToMatch[1].toLowerCase().trim().replace(/,$/, '')}.com`;
      tasks.push({ action: "open", target: url });
  }

  // Match "Search for" command (search on a search engine)
  const searchMatch = input.match(/search for\s+(.+?)\s*(?=\,|$)/i); 
  if (searchMatch) {
      tasks.push({ action: "search", query: searchMatch[1].trim() });
  }

  // Match "Click" commands (click specific elements)
  const clickMatch = input.match(/click\s+(.+?)\s*(?=\,|$)/i); 
  if (clickMatch) {
      tasks.push({ action: "click", target: clickMatch[1].trim() });
  }

  // Stop parsing after the first three tasks
  if (tasks.length >= 3) {
      return tasks;
  }

  return tasks;
}

// Test the parser with relevant input
const userInput = "Go to https://google.com, search for AI tools, click the first link";
console.log(parseUserInput(userInput));

module.exports = { parseUserInput };
