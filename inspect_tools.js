const fs = require('fs');
const path = require('path');

try {
    const filePath = path.join(__dirname, 'web-app/public/the_final_generated_data.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    console.log('--- AI TOOLS SAMPLE ---');
    // Log first 20 non-empty ai_tools
    let count = 0;
    for (const s of data) {
        if (s.ai_tools && s.ai_tools.length > 0 && count < 20) {
            console.log(JSON.stringify(s.ai_tools));
            count++;
        }
    }

    // count occurrences of variations of chatgpt
    let chatgptCount = 0;
    let chatGPTCount = 0;
    let variations = {};

    data.forEach(s => {
        if (s.ai_tools && Array.isArray(s.ai_tools)) {
            s.ai_tools.forEach(t => {
                if (t.toLowerCase().includes('chat')) {
                    variations[t] = (variations[t] || 0) + 1;
                }
            });
        }
    });
    console.log('--- CHATGPT VARIATIONS ---');
    console.log(JSON.stringify(variations, null, 2));

} catch (err) {
    console.error('Error:', err);
}
