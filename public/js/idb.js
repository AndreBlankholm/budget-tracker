
let db;

const request = indexedDB.open('transaction', 1);



request.onupgradeneeded = function (event) {

    const db = event.target.result;

    db.createObjectStore('the_new_transaction', { autoIncrement: true });
};




// upon a success
request.onsuccess = function (event) {

    db = event.target.result;

    // check if app is online, if yes run loadTransaction() function to send all local db data to api
    if (navigator.onLine) {
        // we haven't created this yet, but we will soon, so let's comment it out for now
        loadTransaction();
    }
};


request.onerror = function (event) {
    // log error here
    
    console.log(event)
    console.log(event.target.errorCode);
};


// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['the_new_transaction'], 'readwrite');

    // access the object store for `new_transaction`
    const transactionObjectStore = transaction.objectStore('the_new_transaction');

    // add record to your store with add method
    transactionObjectStore.add(record);
};


function loadTransaction() {
    // open a transaction on your db
    const transaction = db.transaction(['the_new_transaction'], 'readwrite');

    // access your object store
    const transactionObjectStore = transaction.objectStore('the_new_transaction');

    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['the_new_transaction'], 'readwrite');
                    // access the the_new_transaction object store
                    const transactionObjectStore = transaction.objectStore('the_new_transaction');
                    // clear all items in your store
                    transactionObjectStore.clear();

                    alert('All saved transactions have been submitted!');
                })
                .catch(err => {
                    console.log("Other test")
                    console.log(err);
                });
        }
    };

}


// listen for app coming back online
window.addEventListener('online', loadTransaction);