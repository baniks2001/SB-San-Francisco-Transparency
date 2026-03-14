const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    createDefaultTemplate();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });

async function createDefaultTemplate() {
  try {
    console.log('Creating default template...');
    
    // Get the ResolutionTemplate model
    const ResolutionTemplate = require('./src/models/ResolutionTemplate').default;
    
    // Check if template already exists
    const existingTemplate = await ResolutionTemplate.findOne({ templateName: 'Default Resolution Template' });
    if (existingTemplate) {
      console.log('Default template already exists');
      mongoose.connection.close();
      return;
    }
    
    // Create default template
    const defaultTemplate = new ResolutionTemplate({
      templateName: 'Default Resolution Template',
      header: {
        logos: [],
        texts: [
          {
            id: '1',
            text: 'Republic of the Philippines',
            fontSize: 14,
            fontFamily: 'Arial',
            fontColor: '#000000',
            alignment: 'Center',
            isBold: true,
            isUnderline: false,
            isItalic: false
          },
          {
            id: '2',
            text: 'Sangguniang Bayan',
            fontSize: 12,
            fontFamily: 'Arial',
            fontColor: '#000000',
            alignment: 'Center',
            isBold: false,
            isUnderline: false,
            isItalic: false
          }
        ],
        backgroundColor: '#ffffff'
      },
      footer: {
        texts: [
          {
            id: '1',
            text: 'Approved by:',
            fontSize: 12,
            fontFamily: 'Arial',
            fontColor: '#000000',
            alignment: 'Center',
            isBold: false,
            isUnderline: false,
            isItalic: false
          }
        ],
        backgroundColor: '#ffffff'
      },
      content: 'Default resolution content here...',
      paperSize: 'A4',
      defaultPageCount: 1,
      defaultSignatories: [
        {
          name: 'Juan Dela Cruz',
          position: 'Mayor',
          alignment: 'Right',
          isBold: true,
          isUnderline: true
        }
      ]
    });
    
    await defaultTemplate.save();
    console.log('✅ Default template created successfully!');
    
    // Close connection
    mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('❌ Error creating template:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}
