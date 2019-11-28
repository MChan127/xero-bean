# Xero Integration Project by Matthew Chan

## _**Intro**_

This webapp was made by me with **React/JavaScript** as the frontend and **PHP** serving as the backend using the [community Xero-PHP library](https://github.com/calcinai/xero-php/tree/master/src/XeroPHP), in roughly a day and a half. 

Due to the overhead/variances involved in setting up a PHP app running on Apache (as well as needing a database, .env variables and certain credential/key files), I've set up an instance of this project on Amazon AWS EC2, which is much more convenient to access and view.

Please view and test the project using the following link:

http://ec2-34-215-4-91.us-west-2.compute.amazonaws.com/

Use the username `testing` and password `popopo1` to log in.

## _**(Alternative) Manual Setup**_

If you wish to set up this project manually instead of visiting the above link, you must populate each of the .env files in the project (.env.example files are included in the repo) as well as supply a .pem private key for a Xero account.

1. `config/database.env` - Database connection details. A `db_schema.sql` file is included in the project and shows what tables are necessary for the project.
2. `config/general.env` - Just a string representing the absolute location of the server hosting this project. Used by `Xero.php` to find the callback file.....but technically this is no longer necessary seeing that the callback file is within webroot. If running locally, `127.0.0.1` might suffice here.
3. `private/xero/oauth.env` - Consumer key and secret, taken from Xero's dashboard.
4. `private/xero/privatekey.pem` - Private key for Xero generated on their interface.

Run `composer install` and `npm install`, then run `npm run build`. Then set up Apache/LAMP stack pointing to this directory and you're good to go!

## _**User Flow**_

The userflow of the app goes like this:

1. The user must log in, as this is sensitive data involved.
2. Once they log in, they can visit either the "Vendors" or "Accounts" pages to fetch/view their respective data from Xero in a table.
3. Using the interface, the user can filter/modify search criteria to show/hide columns in the table, or search for values within the columns, or sort based on a column.
4. Based on the filters, the user can click to download a CSV file of their current view of the data.

## _**Scope Assumptions**_

Beyond the document, these were the assumed business specs:
- The login system is necessary for security purposes.
- The ability to sort and/or filter rows also makes life way easier and was assumed an unspoken requirement.
- A CSV file is adequate for storage on disk, or at least a convenient format to transfer to other formats of storage.
- Although attempts were made to some degree toward responsive design, due to the size of the data/tables, this app functions and displays best on devices larger than mobile.

## _**Dev Notes**_

### <u>About Security</u>

- The *private app* implementation with an OpenSSL key of Xero is used instead of the public one.
- To keep track of the user session, a hashed token is stored in their session and the database, and for a period of time keeps track of the user even if they leave the site and come back by validating that token.
- There used to be a "remember me" checkbox to prompt the above logic, but was commented out since *not* opting it would log out the user as soon as they visited a different page. A very simple, future solution would be to differentiate between a *shorter* session and a more long-term one if they checked the box.
- Parameterized SQL queries are used to prevent injection through the main database class.
- One instance (there aren't many) of HTML sanitization is used to prevent XSS attacks.
- Access to sensitive files/directories via browser are prohibited by use of <FilesMatch[...]> in the Apache configuration, as well as disabling "Indexes".
- `httpdocs` is effectively the webroot. All folders above containing private keys and other sensitive info are hidden, unreachable by the user.

### <u>General</u>

- Data fetched from Xero is cached, so as to mitigate the number of API requests. This includes caching the different filters used to query for data.
- The `JsonDataTable` component was used to automatically render all given JSON data into a table.
- Rows of data fetched from Xero did *not* consistently have data across all the columns. Meaning that we wouldn't know all the possible fields unless we got maybe halfway looping through the results. We want a nice HTML table that presents all the columns and data in a grid, so here was my solution in the backend to find all the different fields:
    
    1. Sort the data array, from rows that had the _most_ non-empty data across the columns to the least. Make copies of the original data so that any sorting order doesn't become undone. 
    2. Iterate through the columns of the first data row (the one with the most non-empty data), and populate a "master list" of as many columns as possible.
    3. We *still* might have columns left out, if the first row was itself missing any data. So, map-filter-reduce. With our new list of common columns, iterate through the data set again and filter out any rows with fields we didn't account for.
    4. With the filtered set of rows, reduce their columns into an array of unique fields.
    5. Merge our original set of columns with the new one to make a true master list.
    6. With all the columns/fields accounted for now, we now have the means to cleanly lay out all the rows in a grid with the ability to render their empty cells.

- Being able to use the "search by matching" filter is situational, due to some fields being aggregate or a different format such as GUID. Fields that aren't able to use the ".Contains" syntax in the query include: ContactID, Addresses, Balances, HasAttachments, AccountID, etc.

## _**Possible Improvements**_
    
- PHP Monolog library to track errors, notices, and access in different log files in the application (such as an `error.log`, `system.log`, etc.).
- Pagination.
- Refactor code to be even more modular, particularly the frontend.
- Parsing existing values in each column to provide enumerated values for filtering (e.g. different Types or Statuses in a dropdown).
- Possibly creating our own class to call the Xero API directly without relying on the wrapping PHP library to have the most flexibility.