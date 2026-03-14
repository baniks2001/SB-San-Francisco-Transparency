const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    cleanupBase64Data();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });

async function cleanupBase64Data() {
  try {
    console.log('Starting base64 cleanup...');
    
    // Get the ResolutionTemplate model
    const ResolutionTemplate = require('./src/models/ResolutionTemplate');
    
    // Find all templates
    const templates = await ResolutionTemplate.find({});
    console.log(`Found ${templates.length} templates to check`);
    
    for (const template of templates) {
      console.log(`Processing template: ${template.templateName}`);
      
      // Clean up header logos
      if (template.header && template.header.logos) {
        const originalLogos = template.header.logos.length;
        template.header.logos = template.header.logos.map(logo => {
          // Remove base64 URLs and keep only file references
          if (logo.url && logo.url.startsWith('data:')) {
            console.log('  - Removing base64 logo URL');
            return {
              id: logo.id,
              url: '', // Clear the base64 URL
              name: logo.name || 'logo.png'
            };
          }
          return logo;
        });
        console.log(`  - Cleaned ${originalLogos} logos`);
      }
      
      // Clean up any other potentially large fields
      if (template.header && template.header.texts) {
        template.header.texts = template.header.texts.map(text => ({
          ...text,
          // Ensure no large data in text fields
          text: text.text ? text.text.substring(0, 1000) : text.text
        }));
      }
      
      if (template.footer && template.footer.texts) {
        template.footer.texts = template.footer.texts.map(text => ({
          ...text,
          // Ensure no large data in text fields
          text: text.text ? text.text.substring(0, 1000) : text.text
        }));
      }
      
      // Limit content size
      if (template.content && template.content.length > 1000) {
        template.content = template.content.substring(0, 1000) + '...';
        console.log('  - Trimmed large content field');
      }
      
      // Save the cleaned template
      await template.save();
      console.log(`  - Saved cleaned template`);
    }
    
    console.log('✅ Base64 cleanup completed successfully!');
    
    // Close connection
    mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}
