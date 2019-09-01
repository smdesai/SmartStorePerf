// Constants
const INDEX_SPECS = [{path:"key", type:"String"}]
const STORE_CONFIG = {isGlobalStore:true}
const SOUPNAME = "soup"
const SOUP_FEATURES = ["externalStorage"]

// Settings
var settings = {
    useExternalStorage: true,
    // Shape of entries
    depth: 1,               // depth of json objects
    numberOfChildren: 16,   // number of branches at each level
    keyLength: 32,          // length of keys
    valueLength: 65536,     // length of leaf values
    minCharacterCode: 1,    // smallest character code to use in random strings
    maxCharacterCode: 255 // largest character code to use in random strings
}

// Global variable
var storeClient

// Sets up soup
// Drop soup if it already exists
function setupSoup() {
    log("Setting up soup", "blue")
    storeClient.removeSoup(STORE_CONFIG, SOUPNAME)
    .then(() => {
          const soupSpec = {name: SOUPNAME, features: settings.useExternalStorage ? SOUP_FEATURES : []}
          return storeClient.registerSoupWithSpec(STORE_CONFIG, soupSpec, INDEX_SPECS)
      })
    .then(() => {
        log("Soup set up", "green")
        return storeClient.soupExists(STORE_CONFIG, SOUPNAME)
    })
    .then((exists) => {
          if (!exists) log("Soup creation failed", "red")
    })
}

// Function to show / hide element
function showHide(id, show) {
    var classes = document.getElementById(id).classList
    if (show) {
        classes.remove("hidden")
    } else {
        classes.add("hidden")
    }
}

// Function to show / hide settings
function showHideSettings(show) {
    document.getElementById("headerTitle").innerHTML = show ? "Settings" : "Console"
    showHide("divSettings", show)
    showHide("btnSaveSettings", show)
    showHide("btnCancelSettings", show)
    showHide("ulConsole", !show)
    showHide("btnOpenSettings", !show)
    showHide("btnClear", !show)
    showHide("btnInsert10", !show)
    showHide("btnInsert100", !show)
    showHide("btnQueryAll1By1", !show)
    showHide("btnQueryAll10By10", !show)
}

// Function invoked when a btnOpenSettings is pressed
function onOpenSettings() {
    document.getElementById("inputUseExternalStorage").checked = settings.useExternalStorage
    document.getElementById("inputDepth").value = settings.depth
    document.getElementById("inputNumberOfChildren").value = settings.numberOfChildren
    document.getElementById("inputKeyLength").value = settings.keyLength
    document.getElementById("inputValueLength").value = settings.valueLength
    document.getElementById("inputMinCharacterCode").value = settings.minCharacterCode
    document.getElementById("inputMaxCharacterCode").value = settings.maxCharacterCode
    // Show
    showHideSettings(true)
}

// Function invoked when a btnSaveSettings is pressed
function onSaveSettings() {
    const originalUseExternalStorage = settings.useExternalStorage
    settings.useExternalStorage = document.getElementById("inputUseExternalStorage").checked
    settings.depth = parseInt(document.getElementById("inputDepth").value)
    settings.numberOfChildren = parseInt(document.getElementById("inputNumberOfChildren").value)
    settings.keyLength = parseInt(document.getElementById("inputKeyLength").value)
    settings.valueLength = parseInt(document.getElementById("inputValueLength").value)
    settings.minCharacterCode = parseInt(document.getElementById("inputMinCharacterCode").value)
    settings.maxCharacterCode = parseInt(document.getElementById("inputMaxCharacterCode").value)
    // Hide
    showHideSettings(false)

    if (originalUseExternalStorage != settings.useExternalStorage) {
        // Recreate soup if storage type changed
        setupSoup()
    }
}

// Function invoked when a btnCancelSettings is pressed
function onCancelSettings() {
    // Hide
    showHideSettings(false)
}

// Function invoked when a btnClear is pressed
function onClear() {
    storeClient.clearSoup(STORE_CONFIG, SOUPNAME)
        .then(() => {
            log("Soup cleared")
        })
}

// Function returning rounded size in b, kb or mb
function roundedSize(size) {
    if (size < 1024) {
        return size + " b"
    } else if (size < 1024 * 1024) {
        return Math.round(size*100 / 1024)/100 + " kb"
    } else {
        return Math.round(size*100 / 1024 / 1024)/100 + " mb"
    }
}
     
// Function returning approximate entry size as a string
function getEntrySizeAsString() {
    return roundedSize(JSON.stringify(generateEntry()).length)
}


// Function invoked when a btnInsert* button is pressed
function onInsert(n, i, start, actuallyAdded) {
    const entrySize = getEntrySizeAsString()
    i = i || 0
    start = start || time()
    actuallyAdded = actuallyAdded || 0

    if (i == 0) {
        log(`+ ${n} x ${entrySize}`, "blue")
    }
    
    if (i < n) {
        storeClient.upsertSoupEntries(STORE_CONFIG, SOUPNAME, [generateEntry()])
            .then(() => { return onInsert(n, i+1, start, actuallyAdded+1) } )
            .catch(() => { return onInsert(n, i+1, start, actuallyAdded) } )
    }
    else {
        const elapsedTime = time() - start
        log(`+ ${actuallyAdded} in ${elapsedTime} ms`, "green")
    }
}

// Function invoked when a btnQueryAll* button is pressed
function onQueryAll(pageSize) {
    var start = time()
    log(`Q with page ${pageSize}`, "blue")
    storeClient.querySoup(STORE_CONFIG, SOUPNAME, {queryType: "range", path:"key", soupName:SOUPNAME, pageSize:pageSize})
        .then(cursor => {
            log(`Q matching ${cursor.totalEntries}`)
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
        log(`Q ${countSeenSoFar} in ${elapsedTime} ms`, "green")
    }
}

// Helper function to write output to screen
// @param msg to write out
// @param color (optional)
function log(msg, color) {
    var d = new Date()
    var prefix = new Date().toISOString().slice(14, 23)
    msg = color ? msg.fontcolor(color) : msg
    document.querySelector('#ulConsole').innerHTML = `<li class="table-view-cell"><div class="media-body">${prefix}: ${msg}</div></li>`
        + document.querySelector('#ulConsole').innerHTML
}

// Helper function to generate entry
function generateEntry() {
    return {
        key: generateString(settings.keyLength),
        value: generateObject(settings.depth, settings.numberOfChildren, settings.keyLength, settings.valueLength)
        
    }
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
            Math.random() * (settings.maxCharacterCode-settings.minCharacterCode) + settings.minCharacterCode
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
    document.addEventListener("deviceready", function () {
        // Watch for global errors
        window.onerror = (msg) => { log(`windowError fired with ${msg}`, "red") }
        // Connect buttons
        document.getElementById('btnOpenSettings').addEventListener("click", onOpenSettings)
        document.getElementById('btnSaveSettings').addEventListener("click", onSaveSettings)
        document.getElementById('btnCancelSettings').addEventListener("click", onCancelSettings)
        document.getElementById('btnClear').addEventListener("click", onClear)
        document.getElementById('btnInsert10').addEventListener("click", () => { onInsert(10) })
        document.getElementById('btnInsert100').addEventListener("click", () => { onInsert(100) })
        document.getElementById('btnQueryAll1By1').addEventListener("click", () => { onQueryAll(1) })
        document.getElementById('btnQueryAll10By10').addEventListener("click", () => { onQueryAll(10) })
        // Get store client
        storeClient = cordova.require("com.salesforce.plugin.smartstore.client")
        // Sets up soup
        setupSoup()
    })
}

main()
