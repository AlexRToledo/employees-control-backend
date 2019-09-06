# employees-control-backend
Backend for Employees Control

## Configure Backend

- Postgrest
- NodeJS

1. Into project, `config/db/db.config.json`, change respective configuration
    ```json
    {
       "host": "localhost",
        "port": 5432,
        "database": "employees-control",
        "user": "postgres",
        "password": "root"
    }
    ```

2. First Run
    ```bash 
    npm run migrations
    ```

3. Continue with
    ```bash 
    npm install
    ```

4. Start Project
    ```bash 
    npm start
    ```

5. For login use this credentials
    | Email | Password |
    | :------ | :--------: |
    | admin@control.com | root |    

