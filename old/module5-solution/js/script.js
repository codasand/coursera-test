/* script.js */
var dc = (function () {
    'use strict';

    var dataController = {};

    var baseUrl = 'https://davids-restaurant.herokuapp.com/';

    // STEP 0: Create an ajax helper function
    dataController.ajaxHelper = function (uri, method, data) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, uri, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject('Error fetching data');
                    }
                }
            };
            xhr.send(data ? JSON.stringify(data) : null);
        });
    };

    // STEP 0: Get all categories
    dataController.getMenuCategories = function () {
        return this.ajaxHelper(baseUrl + 'categories.json', 'GET');
    };

    // STEP 0: Get menu items for a category
    dataController.getMenuItems = function (categoryShortName) {
        return this.ajaxHelper(baseUrl + 'menu_items.json?category=' + categoryShortName, 'GET');
    };

    // STEP 1: Create a method to get a random category short_name
    dataController.getRandomCategoryShortName = function (categories) {
        var randomIndex = Math.floor(Math.random() * categories.length);
        return categories[randomIndex].short_name;
    };

    // STEP 2: Load the home page with a random category
    dataController.loadHome = function (homeElement) {
        // Fetch categories
        this.getMenuCategories().then(function (response) {
            // Get categories array
            var categories = response;

            // Get random category short_name
            var randomCategoryShortName = dc.getRandomCategoryShortName(categories);

            // STEP 3: Load home-snippet.html
            dc.ajaxHelper('snippets/home-snippet.html', 'GET').then(function (snippet) {
                // STEP 4: Replace {{randomCategoryShortName}} with the random short_name
                var html = snippet.replace('{{randomCategoryShortName}}', "'" + randomCategoryShortName + "'");

                // Insert the HTML into the home element
                homeElement.innerHTML = html;
            }).catch(function (error) {
                console.log('Error loading home snippet:', error);
                homeElement.innerHTML = '<p>Error loading home page</p>';
            });
        }).catch(function (error) {
            console.log('Error fetching categories:', error);
            homeElement.innerHTML = '<p>Error loading categories</p>';
        });
    };

    // Existing method to load menu items
    dataController.loadMenuItems = function (categoryShortName) {
        var mainContent = document.getElementById('main-content');
        this.getMenuItems(categoryShortName).then(function (response) {
            dc.ajaxHelper('snippets/menu-items-snippet.html', 'GET').then(function (snippet) {
                var html = '';
                response.menu_items.forEach(function (item) {
                    var itemHtml = snippet;
                    itemHtml = itemHtml.replace('{{name}}', item.name);
                    itemHtml = itemHtml.replace('{{description}}', item.description || 'No description available');
                    itemHtml = itemHtml.replace('{{price_small}}', item.price_small || 'N/A');
                    itemHtml = itemHtml.replace('{{price_large}}', item.price_large || 'N/A');
                    html += itemHtml;
                });
                mainContent.innerHTML = '<h2>' + response.category.name + '</h2>' + html;
            });
        }).catch(function (error) {
            console.log('Error loading menu items:', error);
            mainContent.innerHTML = '<p>Error loading menu items</p>';
        });
    };

    return dataController;
})();

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    dc.loadHome(document.getElementById('main-content'));
});
