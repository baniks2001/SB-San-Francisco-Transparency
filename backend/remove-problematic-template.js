const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    removeProblematicTemplate();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });

async function removeProblematicTemplate() {
  try {
    console.log('Removing problematic template...');
    
    // Get the ResolutionTemplate model
    const ResolutionTemplate = require('./src/models/ResolutionTemplate');
    
    // Find and remove the template with base64 data
    const result = await ResolutionTemplate.deleteMany({
      $or: [
        { 'header.logos.url': { $regex: '^data:image' } },
        { 'header.logos.url': { $regex: '^data:' } }
      ]
    });
    
    console.log(`✅ Removed ${result.deletedCount} problematic templates`);
    
    // Also remove any templates that might be causing issues
    const allTemplates = await ResolutionTemplate.find({});
    console.log(`Total templates remaining: ${allTemplates.length}`);
    
    // If there are still templates, remove them all to start fresh
    if (allTemplates.length > 0) {
      const deleteAll = await ResolutionTemplate.deleteMany({});
      console.log(`✅ Removed all ${deleteAll.deletedCount} templates for fresh start`);
    }
    
    // Close connection
    mongoose.connection.close();
    console.log('Database connection closed');
    console.log('✅ Cleanup completed! Backend should now start properly.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}
