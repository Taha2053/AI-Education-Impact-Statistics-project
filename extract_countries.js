const fs = require('fs');
const path = require('path');

try {
    const filePath = path.join(__dirname, 'web-app/public/the_final_generated_data.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    const countries = new Set();

    if (Array.isArray(data)) {
        data.forEach(item => {
            if (item.demographics && item.demographics.country) {
                countries.add(item.demographics.country);
            }
        });
    }

    console.log('UNIQUE_COUNTRIES_START');
    console.log(JSON.stringify([...countries].sort(), null, 2));
    console.log('UNIQUE_COUNTRIES_END');

} catch (err) {
    console.error('Error reading file:', err);
}
