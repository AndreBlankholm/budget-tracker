const APP_PREFIX = 'budget-traker';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;


const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./css/styles.css",
    "./js/idb.js",
    "./js/index.js",
    "./manifest.json",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png"
  ];
  



  self.addEventListener('install', function (e) {
    console.log("This")
    e.waitUntil(                                         // ewait make sure the service worker doesn't move on from the installing phase until it fininshes all of it's code
      caches
      .open(CACHE_NAME)
      .then(function (cache) {  // caches.open to find a specific name/ then add every file in that array to the cache
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)
      })
    )
  })


  self.addEventListener('activate', function(e) {  //this step, we clear out all the old data and in the same staep tell the service worker how to manage the caches
    console.log('service worker activated');
    e.waitUntil(
      caches.keys().then(function(keyList) {
        // `keyList` contains all cache names under your username.github.io
        // filter out ones that has this app prefix to create keeplist
        let cacheKeeplist = keyList.filter(function(key) {
          return key.indexOf(APP_PREFIX);
        });
        cacheKeeplist.push(CACHE_NAME);    // cacheKeeplist is an array of URL with the app prefix/ so current cache adds to the keeplist in the activate event listener
  
        return Promise.all(
          keyList.map(function(key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              console.log('deleting cache : ' + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    );
  });


  //fetch event//
self.addEventListener('fetch', e => {
    console.log('service worker: fetching');
    // e.respondWith(fetch(e.request).catch(() => caches.match(e.request))
    e.respondWith(
        fetch(e.request)
        .then(res => {
            //make clone of response//
            const clone = res.clone();
            //open cache
            caches.open(cacheName)
                .then(cache => {
                    //add response to cache
                    cache.put(e.request, clone);
                });
            return res;
        }).catch(err => caches.match(e.request).then(res => res))
    );
});