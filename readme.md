
## Use a Google Sheet as a database for your website. Or just bring a few data with simple statistics from Google Sheet to your website
It does not use the Google Apps script, in only needs a publicly available Google Sheet file which has a unique sheet and one table. 

See it in action here:

https://dimvai.github.io/Get-data-from-Google-Sheets/

## **How to use**:

### 1 **Load** the script to your website. You may or may not use `defer`, according to your needs. Alternatively, you can copy and paste the fetchGoogleSheet function to your code. 

```html
<script defer src="DimSheet.js"></script>
```
### 2 Make your Google Sheet **publicly available** and copy the **URL** that Google Sheets provides during this action.

### 3 In your custom JavaScript code, use the function `fetchGoogleSheet(sheetURL)`. The `sheetURL` is what you got in the previous step. The function returns a promise of an Object, so you can use `async/await` or `then`:

```JavaScript
fetchGoogleSheet(sheetURL).then(GoogleSheet => {
    //your code that uses the returned GoogleSheet Object
}).catch(/*use a custom catch here*/);
```

The object that gets returned from `fetchGoogleSheet(sheetURL)`, in this case the `GoogleSheet` object, contains the following properties and methods:

```JavaScript
//returns the headers (first row of table) as an array:
GoogleSheet.labels  

//returns the data rows of the table as an array of arrays:   
GoogleSheet.rows

//returns header and rows (labels and rows combined) as an array of arrays:            
GoogleSheet.asArrays()    

//returns the data rows as an array of objects, 
//with property names from the headers (first row):
GoogleSheet.asObjects()   

//returns the data rows as an object of objects.
//The objects have names from the first column (row-ID) and property names from the headers.
//The first row must have unique values, of course, for this to work properly:
GoogleSheet.asNamedObjects()

//returns the entire table as an html table (with tr, td, etc)
GoogleSheet.asHtmlTable()
```


## **Examples**
In order to import the entire (HTML) table inside the HTML element with `id="sheetDiv"`, use:
```JavaScript
sheetDiv.innerHTML = GoogleSheet.asHtmlTable().outerHTML;
```

In order to access the second (data) row as an array:
```JavaScript
GoogleSheet.asArrays()[2];
```

In order to access the data at the cell that in the row (row-ID / value of first column) "secretary" and column "surname" use:
```JavaScript
GoogleSheet.asNamedObjects()["secretary"]["surname"];
```


## **Statistics**

You can extract simple statistics for the table using the method `statistics()`. The parameters `fieldToFilter` and `filterValue` are optional in case you want to filter your data, before you extract the statistic. 

```JavaScript
GoogleSheet.statistics(fieldForStatistics,fieldToFilter,filterValue)
```
Examples of statistics:
```JavaScript
//Get the sum of the field (column) "Revenue" (without any filters)
GoogleSheet.statistics("Revenue").sum;
//Get the mean of the field "Rating", with the filter: "FirstName"="Anna"
GoogleSheet.statistics("Rating","FirstName","Anna").mean;
```
The entire `statistics()` object has the following properties: `sum`, `mean`, `mode`, `min`, `max`, `data` (the entire array of the -maybe filtered- data), `size`, `numbers` (an array containing only the valid numbers), `count` (how many valid numbers there are), and `frequencies` (the frequency table as an object). 

### **Advice for Speed/Performance**
If you want to extract multiple statistics for the same array, you are adviced to call statistics only **once**, for speed/performace reasons, so the statistics are not calculated every time:
```JavaScript
//Quick and Performant way:
let revenueStats = GoogleSheet.statistics("Revenue");       //call statistics() only once
let revenue = RevenueStats.sum;
let averageRevenuePerSale = RevenueStats.mean;
let mostPopularSale = RevenueStats.mode;
//Slower way (calls statistics every time):
let revenue = GoogleSheet.statistics("Revenue").sum;
let averageRevenuePerSale = GoogleSheet.statistics("Revenue").mean;
let mostPopularSale = GoogleSheet.statistics("Revenue").mode;

```




