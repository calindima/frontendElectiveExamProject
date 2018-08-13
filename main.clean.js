"use strict";

// Global variables
let lastCustomerServed = 0;
let totalBeersServed = 0;
let queueOverTime = [];

let dashboard = JSON.parse(FooBar.getData());

const allBeersCount = createCounter(dashboard.beertypes);

const allBartendersCount = createCounter(dashboard.bartenders);

// Helper function to create objects used to count the beer sales and productivity of bartenders
function createCounter(stuff) {
    const counter = {};
    stuff.forEach(item => counter[`${item.name}`] = 0);
    return counter;
}

// Interval for refreshing data
setInterval(refreshBarInfo, 5000);

// Show the beer menu
showBeerMenu();

// Function used to initialize bar with refreshed data.
// Core function containing all the helper functions.

function refreshBarInfo(){
    dashboard = JSON.parse(FooBar.getData());

    queueOverTime.push(dashboard.queue.length);
    // console.log(dashboard);
    peopleInQueue(dashboard);
    totalServed(dashboard);
    onlyTheBest('mostPopularBeer', allBeersCount, () => null);
    onlyTheBest('bestEmployee', allBartendersCount, () => {
        dashboard.bartenders.forEach(b => {
            if (b.statusDetail === 'receivePayment') {
                allBartendersCount[`${b.name}`]++;
            }
        })
    });
    showStaff(dashboard.bartenders);
    showOrders(dashboard.serving);
    showTapInfo(dashboard);
    // showStorage(dashboard.storage);
}

// Show beer menu
function showBeerMenu() {
    const beers = JSON.parse(FooBar.getData()).beertypes;
    // console.log(beers);
    const beerTypeTemplate = document.querySelector('#beerTypeTemplate').content;
    const beerTypeParent = document.querySelector('#beerTypes');

    const beerCategoryTemplate = document.querySelector('#beerCategoryTemplate').content;
    const beerCategoryParent = document.querySelector('#beerCategoryList');

    let temp = [];

    beers.forEach(b => {
        // console.log(b);

        // clone beer type
        const beerClone = beerTypeTemplate.cloneNode(true);

        // beer info to be cloned
        const beerArticle = beerClone.querySelector('.beer-type');
        const beerLabel = beerClone.querySelector('.label');
        const beerName = beerClone.querySelectorAll('.name span');
        const beerCategory = beerClone.querySelector('.category span');
        const beerAlcLvl = beerClone.querySelector('.alcohol-lvl span');
        const beerAppearance = beerClone.querySelector('.appearance span');
        const beerMouthFeel = beerClone.querySelector('.mouth-feel span');
        const beerOverallImpression = beerClone.querySelector('.overall-impression span');
        const beerAroma = beerClone.querySelector('.aroma span');
        const beerFlavor = beerClone.querySelector('.flavor span');

        // beer info to be changed for each clone
        beerArticle.dataset.category = b.category.toLowerCase();
        beerLabel.setAttribute('src', `imgs/${b.label.split('.')[0]}.jpg`);
        beerName.forEach(bn => bn.textContent = b.name);
        beerCategory.textContent = b.category;
        beerAlcLvl.textContent = b.alc;
        beerAppearance.textContent = b.description.appearance;
        beerMouthFeel.textContent = b.description.mouthfeel;
        beerOverallImpression.textContent = b.description.overallImpression;
        beerAroma.textContent = b.description.aroma;
        beerFlavor.textContent = b.description.flavor;

        // append beer info to parent
        beerTypeParent.appendChild(beerClone);


        //beer category list staging
        const beerCategoryClone = beerCategoryTemplate.cloneNode(true);
        const beerCategoryItem = beerCategoryClone.querySelector('.beer-category');
        if (!temp.includes(b.category)) {
            temp.push(b.category);
            // TODO: Add a click event listener on each category 
            // to show only the beers pertaining to it
            beerCategoryItem.addEventListener('click', (event) => {
                // console.log('clicked');
                // console.log(event.target.textContent.toLowerCase());
                const categoryName = event.target.textContent.toLowerCase();
                document.querySelectorAll(`[data-category='${categoryName}']`)
                    .forEach(elm => {
                        // console.log(elm);
                        elm.classList.remove('hide');
                        Array.from(elm.parentElement.children).forEach(child => {
                            if (child.dataset.category !== elm.dataset.category) {
                                child.classList.add('hide');
                            }
                        });
                    });
            });
            beerCategoryItem.textContent = b.category;
            beerCategoryParent.appendChild(beerCategoryClone);
        }
    });

    // added event listener to show all beers
    document.querySelector('a.beer-category').addEventListener('click', event => {
        // this variable contains an array formed of all the beer types 
        // by selecting the click target, then his parent ( ul ), 
        // then the parents' sibling ( div#beerTypes ) 
        // then its' children ( beertype articles )
        const allBeerCategoryItems = Array.from(event.target.parentElement.nextElementSibling.children);

        allBeerCategoryItems.forEach(child => child.classList.remove('hide'));
    });
}


//  Show People in queue
function peopleInQueue(dashboard) {
    document.querySelector('#peopleInQueue span').textContent = dashboard.queue.length;
}

//  Show Total customers served
//  Show Total beers served
function totalServed(dashboard) {
    dashboard.serving.forEach(customer => {
        // console.log(customer);
        if (customer.id > lastCustomerServed) {
            lastCustomerServed = customer.id;
            totalBeersServed += customer.order.length;
            // each time a bartender finishes an order for a customer, we count the beers sold
            customer.order.forEach(order => {
                allBeersCount[`${order}`]++;
            });
        }
    });
    document.querySelector('#totalCustomersServed span').textContent = lastCustomerServed;
    document.querySelector('#totalBeersServed span').textContent = totalBeersServed;
}

function onlyTheBest(path, countingObject, callback) {
    callback();

    const theBestContainer = document.querySelector(`#${path} span`);
    let countingArray = Object.values(countingObject);

    Object.keys(countingObject).forEach(key => {
        if (countingObject[`${key}`] == Math.max(...countingArray)) {
            theBestContainer.textContent = key;
        }
    });
}


//  Show Staff info

function showStaff(bartenders) {
    // console.log(bartenders);
    const bartenderTemplate = document.querySelector('#bartenderTemplate').content;
    const parent = document.querySelector('#bartenders');
    parent.innerHTML = '';
    bartenders.forEach(bartender => {
        // console.log(bartender);
        const bartenderClone = bartenderTemplate.cloneNode(true);
        const bartenderName = bartenderClone.querySelector('.name');
        const bartenderStatus = bartenderClone.querySelector('.status');
        const bartenderDetails = bartenderClone.querySelector('.details');

        bartenderName.textContent = bartender.name;
        bartenderStatus.textContent = bartender.status;
        bartenderDetails.textContent = `Detailed status: ${bartender.statusDetail}`;
        if (bartender.servingCustomer !== null) {
            bartenderDetails.textContent += ` for customer #${bartender.servingCustomer};`
        }
        parent.appendChild(bartenderClone);
    });
}

//  Show Current orders

function showOrders(servings) {
    // console.log(servings);
    const orderTemplate = document.querySelector('#orderTemplate').content;
    const parent = document.querySelector('#orders');

    parent.innerHTML = '';
    servings.forEach(serving => {
        // console.log(serving);
        const orderClone = orderTemplate.cloneNode(true);
        const customer = orderClone.querySelector('.customer span');
        const orderList = orderClone.querySelector('ul');


        customer.textContent = serving.id;

        serving.order.forEach(orderItem => {
            // console.log(orderItem);
            const orderListItem = document.createElement('li');

            orderListItem.textContent = orderItem;

            orderList.appendChild(orderListItem);
        });

        parent.appendChild(orderClone);
    });
}

//  Show Tap info
//  Show Level/Capacity
//  Show Storage

function showTapInfo(dashboard) {
    // console.log(taps);
    const tapTemplate = document.querySelector('#tapTemplate').content;
    const parent = document.querySelector('#taps');

    parent.innerHTML = '';
    dashboard.taps.forEach(tap => {
        const tapClone = tapTemplate.cloneNode(true);
        const tapName = tapClone.querySelector('.name');
        const tapLvlCapacity = tapClone.querySelector('.level-capacity');
        const kegInfo = tapClone.querySelector('.info');

        tapName.textContent = tap.beer;
        tapLvlCapacity.textContent = `Level: ${tap.level} / ${tap.capacity}`;
        dashboard.storage.forEach(keg => {
            if(keg.name === tap.beer){
                kegInfo.textContent = `Only ${keg.amount} kegs left in storage.`;
            }
        });

        parent.appendChild(tapClone);
    });
}



// function showStorage(storage) {
//     // console.log(storage);
//     const kegTemplate = document.querySelector('#kegTemplate').content;
//     const parent = document.querySelector('#kegs');

//     parent.innerHTML = '';
//     storage.forEach(keg => {
//         const kegClone = kegTemplate.cloneNode(true);
//         const kegInfo = kegClone.querySelector('.info');

//         kegInfo.textContent = `We have ${keg.amount} kegs of ${keg.name} left.`

//         parent.appendChild(kegClone);
//     });
// }

//event listeners
    // navbar
    document.querySelectorAll('.activateBeerMenu').forEach(elm => elm.addEventListener('click', ()=>{
        document.querySelector('#beerMenu').style.left = '0';
    }));
    document.querySelector('#closeBeerMenu').addEventListener('click', ()=>{
        document.querySelector('#beerMenu').style.left = '-2000px';
    })
    document.querySelectorAll('.activateOrderMenu').forEach(elm => elm.addEventListener('click', ()=>{
        document.querySelector('#currentOrders').style.right = '0';
    }));
    document.querySelector('#closeOrderMenu').addEventListener('click', ()=>{
        document.querySelector('#currentOrders').style.right = '-1000px';
    })

    //  Maybe more...