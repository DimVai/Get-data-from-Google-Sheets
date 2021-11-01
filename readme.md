
## Use a Google Sheet as a database for your website or just bring a few data from Google Sheet to your website
It does not use the Google Apps script, in only needs a publicly available Google Sheet whitch has only a unique table. 

See it in action here:

https://dimvai.github.io/Get-data-from-Google-Sheets/

## **How to use**:

### 1 **Load** the script to your website. You may or may not use `defer`, according to your needs. Alternatively, you can copy and paste the fetchGoogleSheet function to your code. 

```html
<script defer src="DimSheet.js"></script>
```
### 2 Make your Google Sheet **publicly available** and copy the **URL** that Google Sheets provides you.

### 3 In your custom JavaScript code, use the function `fetchGoogleSheet(sheetURL)` that this add-in provides. The `sheetURL` is what you got in the previous step. The function returns a promise of an Object, so you can use `async/await` or `then`:

```JavaScript
fetchGoogleSheet(sheetURL).then(GoogleSheet => {
    //your code that uses the GoogleSheet Object
}).catch(/*use a custom catch here*/);
```

The object that gets returned from `fetchGoogleSheet(sheetURL)`, in this case the `GoogleSheet` object, contains the following properties and methods:

```JavaScript
//retruns the headers (first row of table) as an array:
GoogleSheet.labels  
//retruns the data rows of the table as an array of arrays:   
GoogleSheet.rows
//retruns header and rows (labels and rows combined) as an array of arrays:            
GoogleSheet.asArrays()      
//retruns the data rows as an array of objects, with property names from the header row
GoogleSheet.asObjects()     
//retruns the data rows as an object of objects 
//with names from the first column (row-ID) and property names from the header row.
//The first row must have unique valus, for this to work properly:
GoogleSheet.asNamedObjects()
//retruns the entire table as an html table 
GoogleSheet.asHtmlTable()
```

## **Examples**
In order to import the entire table in the HTML element with `id="outputTable"`, use:
```JavaScript
outputTable.innerHTML = GoogleSheet.asHtmlTable().outerHTML;
```

In order to access the second data row as an array:
```JavaScript
GoogleSheet.asArrays()[2];
```

In order to access the data at the cell that in the row with row-ID (first column) "abc" and column "surname" use:
```JavaScript
GoogleSheet.asNamedObjects()["abc"]["surname"];
```
