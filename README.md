# ToDoNest

## About ToDoNest 📝

ToDoNest is a web-based platform where users can securely create accounts, log in, and manage personalized to-do lists. ✅ Each user has their own task manager, allowing them to organize, prioritize, and track tasks easily. 📅 The project is still in progress, with more features to come, designed to enhance productivity and simplify task management. 🚀

### Frontend
Navigate to the frontend directory and start the React application:

```bash
cd frontend
npm start
```
The frontend application will run on http://localhost:3000.

## Available Scripts

In the project directory, you can run:

```bash
npm start
```
Runs the app in the development mode.

Open http://localhost:3000 to view it in your browser.

The page will reload when you make changes.

You may also see any lint errors in the console.

```bash
npm test
```

Launches the test runner in the interactive watch mode.

## Learn More

You can learn more in the Create React App documentation.

To learn React, check out the React documentation.

Code Splitting
This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

Analyzing the Bundle Size
This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

Making a Progressive Web App
This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

Advanced Configuration
This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration ```

### Backend
Navigate to the backend directory and start the Express server:

```bash
cd backend
npm install
npm start
node index.js
```
The backend server will run on http://localhost:5000.

### Database
Ensure PostgreSQL is running and create the `users` table:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar BYTEA,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Environment Variables
Create a `.env` file in the backend directory with the following content:

```
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgres://postgres:5233@localhost:5432/todonest
```
