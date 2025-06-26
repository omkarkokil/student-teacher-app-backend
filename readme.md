# Document about The given assignments

## Create the first basic node app using nodejs sequelize postgres sql

1 Created app.js file where used express to create a server
2 In it used cors package to handle cors error to required integration for now used "\*" which grants resources or api to all networks
3 after it use app.listen to start our backend app

- To connect with db of postgres
  1 Create a config.json file in config folder where added configuration such as password , username , db etc
  2 Create a database.js file in config folder where created a sequelize object where added parameter like host , user , password etc
  3 Using sequelize.sync connected with out local db

- Routes
  1 For creating different routes use the express.Router() object to create different routes in different folder such as User , post routes etc
  2 After it create routes ex route.get("/" , function) where route the variable where we store the Router object after the . there is request which we want ex Get , Post , Delete , Put etc. Then add endpoint where api is hit and at last added the function which works after hit endpoint

- Middleware
  1 Created a middleware for auth which is in middleware\authMiddleware.js where we can ask for authorization token come from authorization header
  2 After this if we want to protect or add this middleware we simply need to add the authorization as authMiddleware in api routes in between endpoint request and the endpoint function
  3 So every time user want to access the api he need the authorization token to access the api

## Migration Script

- First we need to create a migration file which we create using `npx sequelize-cli migration:generate --name <file name>`
- Now all migration files are in the /migration folder
- To run the migration script use the command
  `npx sequelize-cli db:migrate`

## Indexing

- In the User/model.js where sequalize model exits for user added two index form email & name search
- Implemented it using a get request which is in `app/User/route.js` file endpoint is `/search-user` where it get name and email of user from the query and then process it using indexes for performance and fast search

### Basic PUT/POST/DELETE/GET request for teacher and student

1 Here i created teacher and student model in same user file where there is relation between user and teacher same as user and student via userId
2 After it in `app/Teacher/route` and `app/Student/route` created the endpoints for request

## Reading the csv file and writing new one using stream

First, I created the API route directly in the `app.js` file with the endpoint `/api/v1/dummy-emails`.

**How it works:**

1. A readable stream is created for the input CSV file, and a writable stream for the output CSV file.
2. As the input file is read in chunks, each chunk is split into lines.
3. Each line containing an email is processed: the domain is extracted from the email, and both are written to the output file in the format `email,domain`.
4. The process handles large files efficiently by processing and writing in batches (e.g., 100 lines at a time), using streams to avoid loading the entire file into memory.
5. When the stream ends, any remaining lines are processed and written to the output file.

This approach is efficient for large CSV files and avoids memory issues by leveraging Node.js streams.

## Understanding and using the SQS and S3 bucket

- For SQS and S3 operations, scripts like `sendMessage.js` and `getMessage.js` are run directly using Node.js (e.g., `node sendMessage.js`), not as API endpoints.
- The CSV processing logic in `/app/Upload/uploads3.js` streams data directly from S3, processes it in memory-efficient chunks, and uploads the result back to S3 without creating local files.
- Similarly, SQS messages are sent and received using standalone scripts, which can interact with S3 to store or retrieve data as needed.

This approach avoids creating additional APIs and leverages direct script execution for backend processing tasks.
