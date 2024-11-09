# ToDoNest

ToDoNest is a web app where users can sign up, log in, and manage their personal to-do lists. ✅ The project is still in progress, with more features on the way! 🚀

### Frontend
Navigate to the frontend directory and start the React application:

```bash
npm install multer
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

See the section about running tests for more information.

```bash
npm run 
```

Builds the app for production to the build folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about deployment for more information.

```bash
npm run eject
```

Note: this is a one-way operation. Once you eject, you can't go back!

If you aren't satisfied with the build tool and configuration choices, you can eject at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except eject will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use eject. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However, we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

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
