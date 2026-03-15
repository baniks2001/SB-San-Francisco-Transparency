# Google Maps Integration Setup

## Overview
The Sangguniang Bayan Transparency Portal now includes Google Maps integration to display the location of the SB building in the footer of the website.

## How to Configure

### Step 1: Access Admin Settings
1. Log in to the admin panel
2. Navigate to **Settings** from the admin menu

### Step 2: Set Map Location
1. Scroll down to the **"Google Maps Location"** section
2. Click **"Edit Location"** button
3. Fill in the following information:
   - **Latitude**: The latitude coordinate of the SB building
   - **Longitude**: The longitude coordinate of the SB building  
   - **Address**: The full address that will be displayed

### Step 3: Finding Coordinates
To find the exact coordinates of the Sangguniang Bayan building:

1. **Using Google Maps:**
   - Go to [Google Maps](https://maps.google.com)
   - Search for the SB building address
   - Right-click on the exact location
   - Select the coordinates from the context menu
   - Copy the latitude and longitude values

2. **Example Coordinates for San Francisco, Southern Leyte:**
   - Latitude: `10.1234`
   - Longitude: `124.5678`
   - Address: `Sangguniang Bayan Building, San Francisco, Southern Leyte, Philippines`

### Step 4: Save Settings
1. Click **"Save Changes"** after entering the coordinates
2. The map will automatically appear in the website footer
3. Users can click on the map to get directions or view it on Google Maps

## Features
- **Interactive Map**: Users can pan, zoom, and interact with the map
- **Direct Link**: Click "View on Google Maps" to open in full Google Maps
- **Responsive Design**: Map adapts to different screen sizes
- **Fallback Display**: Shows placeholder if coordinates are not set

## Troubleshooting

### Map Not Showing
- Ensure latitude and longitude are valid numbers
- Check that both coordinates are filled in
- Verify the coordinates format (decimal degrees)

### Incorrect Location
- Double-check the coordinates using Google Maps
- Ensure positive/negative signs are correct for the hemisphere
- Test the coordinates by searching them directly in Google Maps

### Map Loading Issues
- The map uses Google Maps embed which requires internet connection
- Some ad blockers might interfere with map loading
- Corporate firewalls might block Google Maps services

## Notes
- No Google Maps API key is required - this uses the free embed version
- The map will automatically show a pin at the specified location
- Users can get directions directly from the map interface
- The address field is used for the map title and information display
