// Constants
const SOUPNAME = "soup"
const SOUP_FEATURES = ["externalStorage"]
const INDEX_SPECS = [{path:"key", type:"String"}]
const STORE_CONFIG = {isGlobalStore:false}
const PAGE_SIZE = 2

// Shape of entries
const DEPTH = 2 // depth of json objects
const NUMBER_OF_CHILDREN = 3 // number of branches at each level
const KEY_LENGTH = 32 // length of keys
const VALUE_LENGTH = 100 // length of leaf values
const MIN_CHARACTER_CODE = 32 // smallest character code to use in random strings
const MAX_CHARACTER_CODE = 255 // largest character code to use in random strings
const ENTRY_SIZE = JSON.stringify(generateEntry()).length

// Global variable
var storeClient
var logLine = 1

// Sets up soup
// @return a promise
function setupSoup() {
    return storeClient.soupExists(SOUPNAME)
        .then(exists => {
            if (!exists) {
                log("Registering soup")
                return storeClient.registerSoupWithSpec({name: SOUPNAME, features: SOUP_FEATURES}, INDEX_SPECS)
                    .then(() => {
                        log("Soup registered")
                        return storeClient.soupExists(SOUPNAME)
                    })
            }
            else {
                return true
            }
        })
}

// Function invoked when a btnClear is pressed
// @return a promise
function onClear() {
    return storeClient.clearSoup(SOUPNAME)
        .then(() => {
            log("Soup cleared")
        })
}

// Function invoked when a btnInsert* button is pressed
// @return a promise
function onInsert(n, i, start, actuallyAdded) {
    i = i || 0
    start = start || time()
    actuallyAdded = actuallyAdded || 0

    if (i == 0) {
        log(`Adding ${n} entries - ${ENTRY_SIZE} chars each`, "blue")
    }
    
    if (i < n) {
        return storeClient.upsertSoupEntries(SOUPNAME, [generateEntry()])
            .then(() => { return onInsert(n, i+1, start, actuallyAdded+1) } )
            .catch(() => { return onInsert(n, i+1, start, actuallyAdded) } )
    }
    else {
        const elapsedTime = time() - start
        log(`Added ${actuallyAdded} entries in ${elapsedTime} ms`, "green")
    }
}

// Function invoked when a btnQueryAll* button is pressed
// @return a promise
function onQueryAll(pageSize) {
    var start = time()
    log(`Querying store with page size ${pageSize}`, "blue")
    return storeClient.querySoup(STORE_CONFIG, SOUPNAME, {queryType: "range", path:"key", soupName:SOUPNAME, pageSize:PAGE_SIZE})
        .then(cursor => {
            log(`Query matching ${cursor.totalEntries} entries`)
            return traverseResultSet(cursor, cursor.currentPageOrderedEntries.length, start)
        })
}

// Helper for onQueryAll to traverse the result set to the end and count number of records actually returned
function traverseResultSet(cursor, countSeenSoFar, start) {
    if (cursor.currentPageIndex < cursor.totalPages - 1) {
        return storeClient.moveCursorToNextPage(STORE_CONFIG, cursor)
            .then(cursor => {
                return traverseResultSet(cursor, countSeenSoFar + cursor.currentPageOrderedEntries.length, start)
            })
    } else {
        const elapsedTime = time() - start
        log(`Query returned ${countSeenSoFar} entries in ${elapsedTime} ms`, "green")
    }
}

// Helper function to write output to screen
// @param msg to write out
// @param color (optional)
function log(msg, color) {
    msg = color ? msg.fontcolor(color) : msg
    document.querySelector('#ulConsole').innerHTML = `<li class="table-view-cell"><div class="media-body">${logLine}: ${msg}</div></li>`
        + document.querySelector('#ulConsole').innerHTML
    logLine++
}

// Helper function to generate entry
function generateEntry() {
    return {key:generateString(KEY_LENGTH), value:generateObject(DEPTH, NUMBER_OF_CHILDREN, KEY_LENGTH, VALUE_LENGTH)}
}

// Helper function to generate object
// @param depth
// @param numberOfChildren
// @param keyLength
// @param valueLength
function generateObject(depth, numberOfChildren, keyLength, valueLength) {
    if (depth > 0) {
        var obj = {}
        for (var i=0; i<numberOfChildren; i++) {
            obj[generateString(keyLength)] = generateObject(depth-1, numberOfChildren, keyLength, valueLength) 
        }
        return obj
    } else {
        return generateString(valueLength)
    }
}

// Helper function to generate string of length l
// @param l desired length
function generateString(l) {
    return [...Array(l)].map(() => {
        return String.fromCharCode(
            Math.random() * (MAX_CHARACTER_CODE-MIN_CHARACTER_CODE) + MIN_CHARACTER_CODE
        )
    }).join('')
}

// Helper function to return current time in ms
function time() {
    return (new Date()).getTime()
}

// main function
// Log in if needed
// Sets up soup if needed
function main() {
    force.login(
        function() {
            log("Auth succeeded") 
            // Watch for global errors
            window.onerror = (msg) => { log(`windowError fired with ${msg}`, "red") }
            // Connect buttons
            document.getElementById('btnClear').addEventListener("click", onClear)
            document.getElementById('btnInsert10').addEventListener("click", () => { onInsert(10) })
            document.getElementById('btnInsert100').addEventListener("click", () => { onInsert(100) })
            document.getElementById('btnQueryAll1By1').addEventListener("click", () => { onQueryAll(1) })
            document.getElementById('btnQueryAll10By10').addEventListener("click", () => { onQueryAll(10) })
            // Get store client
            storeClient = cordova.require("com.salesforce.plugin.smartstore.client")
            // Sets up soup
            setupSoup(storeClient)
                .then(exists => {
                    log("Verified that soup exists")
                })
        },
        function(error) {
            log(`Auth failed: ${error}`)
        }
    )
}

main()
