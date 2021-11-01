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

                };
                resolve (result);

            }).catch(e=>{console.error(e);reject(e)});
        });
    }
