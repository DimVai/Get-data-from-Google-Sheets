/**
 * @file DimSheet.js.
 * @author Dimitris Vainanidis,
 * @copyright Dimitris Vainanidis, 2021
 */


/* jshint unused:false , esversion: 10 */
'use strict';

/**
 * Fetches the data from a Google Sheet. 
 * Returns a promise of an object. 
 * @param {URL} sheetLink 
 * @returns Promise Object
 */
function fetchGoogleSheet(sheetURL){
    return new Promise(function(resolve, reject) {        

        if (!sheetURL.includes("docs.google.com/spreadsheets/d/")) {console.error('Invalid Google Sheet URL'); reject({});return}       //(not inside then/catch)
        //get URL string until the last "/", or entire string (if programmer provided the clean URL)
        let linktoFetch = sheetURL.includes("edit") ? sheetURL.match('.*/')[0] : sheetURL;
        let fetchStringEnding = linktoFetch.slice(-1)=="/" ? "gviz/tq?" : "/gviz/tq?";      //add this to the end of URL string
        linktoFetch += fetchStringEnding;

        fetch(linktoFetch)

            .then(res => {
                if (res.ok) {return res.text()}         //res is always a valid response 
                else {throw "Can't fetch Google Sheet"}
            })

            .then(data =>{
                const cleanData = data.match(/{.+}/);   //get string between outer { } 
                try{
                    const sheet = JSON.parse(cleanData);      
                    if (sheet.status != "ok") {throw sheet}         //in case of error it is {status:"error"}
                    return sheet.table;
                } catch(sheet){
                    console.error(cleanData);
                    console.error(sheet);
                    throw("Although we found a valid Google Sheet, we can't access its data");
                }

            }).then(table=>{
                const labels = table.cols.map(column => column.label);
                const rows = table.rows.map(row => row.c.map(cell => cell.v));

                const makeAnObject = (labels, values) => {
                    const len = labels.length;
                    let obj={};
                    for (let i = 0; i < len; i++) {
                        obj[labels[i]]=values[i]||null;
                    }
                    return obj;
                };

                const stats = array => {
                    if (!Array.isArray(array)) {console.error("Not an array in stats(array) function");return null} 
                    let [data,size,sum,mean,mode,min,max] = [array,array.length,null,null,null,null,null];
                    //numbers,count,min,max
                    let numbers = data.filter(n=>!isNaN(n));
                    let count = numbers.length;
                    //sum,mean
                    if (count){   //if no numbers at all, sum=mean=null
                      sum = numbers.reduce((a,b)=>a+b); 
                      mean = sum/count; 
                      min = Math.min(...numbers);
                      max = Math.max(...numbers);
                    }
                    //frequencies
                    let frequencies = {};
                    array.forEach(value => {
                      frequencies[value.toString()] = (frequencies[value.toString()]??0) + 1;  // jshint ignore:line
                    });
                    //mode
                    let maxFreq = Math.max(...Object.values(frequencies));
                    mode = Object.keys(frequencies).find(key => frequencies[key] == maxFreq);
                    if (!isNaN(mode)) {mode = Number(mode)}         //convert string to number if you can
                    return {data,size,numbers,count,sum,mean,mode,min,max,frequencies};
                };

                let result = {labels,rows,
                    asArrays:function(){
                        return [[...labels],...rows];
                    },
                    asObjects:function(){
                        let asObjects = [];
                        rows.forEach(row=>asObjects.push(makeAnObject(labels,row)));
                        return asObjects;
                    },
                    asNamedObjects: function(){
                        let obj = {};
                        rows.forEach(row=>{
                            obj[row[0]] = makeAnObject(labels,row);
                        });
                        return obj;
                    }, 
                    asHtmlTable: function(){
                        let asHtmlTable = document.createElement('table');
                        let innerTable = '';
                        let makeTableRow = (identifier,valuesArray) => {
                            let rowItems = valuesArray.map(value=>`<${identifier}>${value}</${identifier}>`); 
                            return '<tr>'+rowItems.join('')+'</tr>';
                        };
                        innerTable += makeTableRow('th',this.labels);
                        this.rows.forEach(row=>{innerTable += makeTableRow('td',row)});
                        asHtmlTable.innerHTML = innerTable;
                        return asHtmlTable;
                    },
                    statistics: function(fieldForStatistics,fieldToFilter,filterValue){
                        if (!fieldForStatistics) {console.error("Missing field in statistics(field) method");return null}
                        let filteredArray = (fieldToFilter) ? this.asObjects().filter(row=>row[fieldToFilter]==filterValue) : this.asObjects();
                        return stats(filteredArray.map(row=>row[fieldForStatistics]));
                    },

                };

                resolve (result);

            }).catch(e=>{console.error(e);reject(e)});
        });
    }
