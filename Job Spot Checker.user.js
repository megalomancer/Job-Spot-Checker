// ==UserScript==
// @name         Job Spot Checker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Checks the amount of open employee spots in companies.
// @author       Megalomancer [1923076] and friend
// @match        https://www.torn.com/joblist.php*
// @grant        none

// ==/UserScript==
// PLEASE REMEMBER THAT YOU ARE LIMITED TO 100 API CALLS PER MINUTE.

// Add your API key between the quotation marks. Do not delete the quotation marks.
var APIKEY = "";

//Allows the script to work between job pages without needing to refresh.
window.addEventListener("load", preFunc);
window.addEventListener("hashchange", preFunc);

//Makes the script wait one second to load the job listings before doing anything.
function preFunc() {
    setTimeout(func, 1000);
};

//Adds a button to trigger the calls.
function func() {
    'use strict';
    let addBtn = document.querySelector("div.gallery-wrapper"); //Adds the button after the top number bar.
    let btn = document.createElement('BUTTON');
    btn.id = "employ";
    btn.innerHTML = 'SHOW EMPLOYMENT';
    btn.type = "button";
    btn.className = 'torn-btn';
    addBtn.insertAdjacentElement('afterend', btn);
    document.getElementById("employ").addEventListener("click", buttonFunc);
};

async function buttonFunc() {
    'use strict';
    //Checks specific URLs because Ched.
    let sentinel = false;
    let URLS = ['https://www.torn.com/joblist.php#p=corp&ID=', 'https://www.torn.com/joblist.php#/p=corp&ID=',
                   'https://www.torn.com/joblist.php#!p=corp&ID=', 'https://www.torn.com/joblist.php#p=corp&ID='];
    URLS.forEach((u) => {
        if (window.location.href.startsWith(u)) {
            sentinel = true;
        };
    });
    //Grabs company IDs to be used for API calls.
    let listIds = [];
    if(sentinel) {
        var bigList = document.getElementsByClassName("view");
        let reg = /([\d]*)/;
        for (var i = 1; i < bigList.length; i++) {
            listIds.push(bigList[i].innerHTML.substring(30,35)); // This is disgusting I'm sorry you have to see this.
        };
    };
    //Prepares the page to be edited after the API calls resolve.
    var numEmploy = [], maxEmploy = [];
    var temp = document.getElementsByClassName('company t-overflow');
    let list = [];
    for (let x = 0; x < temp.length; x++) {
        list.push(temp[x]);
    };
    //Makes the API calls then puts the information on the page.
    list.splice(0,1); // Your current job is always added the the list at index 0. This removes it to reduce API calls.
    for (let i = 0; i < listIds.length; i++) {
        list[i].id = i;
        const res = await fetch('https://api.torn.com/company/' + listIds[i] + '?selections=&key=' + APIKEY);
        const data = await res.json();
        //Throws a message if the API key is invalid.
        if (typeof data.company === "undefined") {
            alert ("API failed to fetch. Check that your key is correct or that you haven't exceeded the API call limit.");
            break; //This is to prevent more than one alert from appearing.
        } else {
            document.getElementById(i).innerHTML += `|${data.company.employees_hired}/${data.company.employees_capacity}|`;
        };
    };
};
