# Phonebook Application

## Features

The Phonebook Application is a responsive, feature-rich Angular application that allows users to manage their contact information effectively. Key features include:

- **Contact Management:**
  - Add, edit, and soft delete single or multiple contacts.
  - View detailed contact information.
  - Filter contacts by favorites, non-deleted, groups, or the top 10 most recent.
  - Group category filtering.
  - Arranged Alphabetically by default

- **Responsive Design:**
  - Optimized for various screen sizes, with buttons stacking vertically on smaller screens.

- **Contact Details Page:**
  - Displays detailed fields such as first name, last name, email, phone, image URL, address, group category, added date, and last viewed date.
  - Allows inline editing.

- **Favorites Toggle:**
  - Quickly mark contacts as favorites for easy access.
 
  -**Grid/List View Toggle:**
  - Quickly switch between grid view and list view.

- **Confirmation Dialogs:**
  - Displays confirmations for updates and deletions using a notification service.

## Project Setup

### Prerequisites
Ensure you have the following installed on your system:
- **Node.js:** Version 18 or later
- **Angular CLI:** Version 19 or later

### Installation Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd phonebook-application
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Server
To run the app locally:
1. Start the development server:
   ```bash
   ng serve
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:4200
   ```

The app will automatically reload if you make changes to any of the source files.

## Project Structure
- **src/app:** Contains the core application files, including components, services, and mock data.
- **assets:** Stores static files such as images and styles.
- **environments:** Configuration for development and production environments.

## Notes
- Inline form validation ensures all required fields (e.g., `firstName`, `lastName`, `email`, `phone`) are filled.
- Contact data is managed using a service that handles filtering and CRUD operations.
- Styling is adjusted for better color contrast, ensuring accessibility.

