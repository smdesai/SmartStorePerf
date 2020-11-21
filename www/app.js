// Constants
const STORE_CONFIG = {isGlobalStore:true}
const SOUPNAME = "soup"
const SMART_QUERY = "select {soup:key}, {soup:_soup} from {soup}"


// Preset settings
var presetDefault = {
    extJSONStream: true,
    extJSONMemory: false,
    smartStoreSFJSONUtils: false,
    smartStoreNSJSONSerialize: false,
    rawSqlite: false,
    // Shape of entries
    keyLength: 32,
    valueStart: 100,
    valueIncrement: 100,
    valueLength: 1000
}

// Global variables
var storeClient
var settings = Object.assign({}, presetDefault)

function getSoupSpec() {
    var features = [ settings.valueLength ]
    if (settings.extJSONStream) {
        features.push("extJSONStream")
    }
    if (settings.extJSONMemory) {
        features.push("extJSONMemory")
    }
    if (settings.extJSONStream || settings.extJSONMemory) {
        features.push("externalStorage")
    }
    if (settings.smartStoreSFJSONUtils) {
        features.push("smartStoreSFJSONUtils")
    }
    if (settings.smartStoreNSJSONSerialize) {
        features.push("smartStoreNSJSONSerialize")
    }
    if (settings.rawSQLite) {
        features.push("rawSQLite")
    }
    return {name: SOUPNAME, features: features}
}

function getIndexSpecs() {
    var val = (settings.extJSONStream || settings.extJSONMemory) ? "string" : "json1"
    return [{path:"key", type: val}];
}


// Sets up soup
// If soup already exists:
// - if dropIfExist is true, the existing soup is removed and a new soup is created
// - if dropIfExist is false, the existing soup is left alone
function setupSoup(removeIfExist) {
    var createSoup = () => {
        log("Setting up soup", "blue")
        return storeClient.registerSoupWithSpec(STORE_CONFIG, getSoupSpec(), getIndexSpecs())
            .then(() => { log("Soup set up", "green") })
    }

    storeClient.soupExists(STORE_CONFIG, SOUPNAME)
        .then((exists) => {
            if (exists && removeIfExist) {
                log("Removing soup", "blue")
                return storeClient.removeSoup(STORE_CONFIG, SOUPNAME)
                    .then(() => {
                        log("Removed soup", "green")
                        createSoup()
                    })
            } else {
                createSoup()
            }
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
    showHide("btnPresetDefault", show)
    showHide("ulConsole", !show)
    showHide("btnOpenSettings", !show)
    showHide("btnClear", !show)
    showHide("btnInsert10", !show)
//    showHide("btnInsert100", !show)
//    showHide("btnQueryAll1By1", !show)
//    showHide("btnQueryAll10By10", !show)
}

// Function to populate inputs in settings screen
function populateSettingsInputs(s) {
    if (s.hasOwnProperty("extJSONStream")) document.getElementById("inputExtJSONStream").checked = s.extJSONStream
    if (s.hasOwnProperty("extJSONMemory")) document.getElementById("inputExtJSONMemory").checked = s.extJSONMemory
    if (s.hasOwnProperty("smartStoreSFJSONUtils")) document.getElementById("inputSmartStoreSFJSONUtils").checked = s.smartStoreSFJSONUtils
    if (s.hasOwnProperty("smartStoreNSJSONSerialize")) document.getElementById("inputSmartStoreNSJSONSerialize").checked = s.smartStoreNSJSONSerialize
    if (s.hasOwnProperty("inputRawSQLite")) document.getElementById("inputRawSQLite").checked = s.rawSQLite

    if (s.hasOwnProperty("keyLength")) document.getElementById("inputKeyLength").value = s.keyLength
    if (s.hasOwnProperty("valueStart")) document.getElementById("inputValueStart").value = s.valueStart
    if (s.hasOwnProperty("valueLength")) document.getElementById("inputValueLength").value = s.valueLength
    if (s.hasOwnProperty("valueIncrement")) document.getElementById("inputValueIncrement").value = s.valueIncrement

}

// Function invoked when a btnOpenSettings is pressed
function onOpenSettings() {
    populateSettingsInputs(settings)
    // Show
    showHideSettings(true)
}

// Function invoked when one of the preset button is pressed
function onPreset(s) {
    populateSettingsInputs(s)
}

// Function invoked when a btnSaveSettings is pressed
function onSaveSettings() {
    settings.extJSONStream = document.getElementById("inputExtJSONStream").checked
    settings.extJSONMemory = document.getElementById("inputExtJSONMemory").checked
    settings.smartStoreSFJSONUtils = document.getElementById("inputSmartStoreSFJSONUtils").checked
    settings.smartStoreNSJSONSerialize = document.getElementById("inputSmartStoreNSJSONSerialize").checked
    settings.rawSQLite = document.getElementById("inputRawSQLite").checked

    settings.keyLength = parseInt(document.getElementById("inputKeyLength").value)
    settings.valueStart = parseInt(document.getElementById("inputValueStart").value)
    settings.valueLength = parseInt(document.getElementById("inputValueLength").value)
    settings.valueIncrement = parseInt(document.getElementById("inputValueIncrement").value)

    // Hide
    showHideSettings(false)

    setupSoup(true)
}

// Function invoked when a btnCancelSettings is pressed
function onCancelSettings() {
    // Hide
    showHideSettings(false)
}

// Function invoked when a btnClear is pressed
function onClear() {
    log("Clearing soup", "blue")
    storeClient.clearSoup(STORE_CONFIG, SOUPNAME)
        .then(() => {
            log("Soup cleared", "green")
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
    var entrySize = getEntrySizeAsString()
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
        var elapsedTime = time() - start
        log(`+ ${actuallyAdded} in ${elapsedTime} ms`, "green")
    }
}

//function sleep(ms) {
//    return new Promise(resolve => setTimeout(resolve, ms));
//}

// n - number of tests to run for ps .. pe by pi
// ps - payload start
// pe - payload end
// pi - payload increment
// i  - current index to n
// pa - actual value from ps .. pe
function onRunTest(n, ps, pe, pi, i, pa, start, actuallyAdded) {
    var entrySize = getEntrySizeAsString()
    i = i || 0
    start = start || time()
    actuallyAdded = actuallyAdded || 0
    pa = pa || ps
    
    if (i === 0 && pa <= pe) {
        log(`+ ${n} x ${entrySize} @ ${pa}`, "blue")
    }
            
    if (pa <= pe) {
        if (i < n) {
            storeClient.upsertSoupEntries(STORE_CONFIG, SOUPNAME, [generateEntry()])
                .then(() => { return onRunTest(n, ps, pe, pi, i+1, pa, start, actuallyAdded+1) } )
                .catch(() => { return onRunTest(n, ps, pe, pi, i+1, pa, start, actuallyAdded) } )
        } else {
            var elapsedTime = time() - start
            log(`+ ${actuallyAdded} in ${elapsedTime} ms`, "green")
            onRunTest(n, ps, pe, pi, 0, pa + pi)
        }
    } else {
        log(`Test run complete`, "green")
    }
}

function onReset() {
    log("Erase perf data", "blue")
    storeClient.resetPerfDb(STORE_CONFIG, SOUPNAME)
        .then(() => {
            log("Perf data erased", "green")
        })
}

function onDump() {
    log("Export perf data", "blue")
    storeClient.dumpPerfDb(STORE_CONFIG, SOUPNAME)
        .then(() => {
            log(`Perf data exported`, "green")
        })
}

// Function invoked when a btnQueryAll* button is pressed
function onQueryAll(pageSize) {
    var start = time()
    log(`Q with page ${pageSize}`, "blue")
    storeClient.runSmartQuery(STORE_CONFIG, {queryType: "smart", smartSql:SMART_QUERY, pageSize:pageSize})
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
        var elapsedTime = time() - start
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
    try {
        return {
            key: generateString(settings.keyLength),
            value: generateObject(settings.valueLength)
        }
    }
    catch (err) {
        log(`Could not generate entry: ${err.message}`, "red")
        throw err
    }
}

// Helper function to generate object
// @param valueLength
function generateObject(valueLength) {
    return generateJson(valueLength)
}

function makeId(length) {
    var result           = ''
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
        for (var i = 0; i < length; ++i) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

function generateJson(l) {
    var count = Math.round(l*1024 / 137)
    var data = []
    for (var i = 0; i < count; i++) {
        data.push({"first":makeId(34),"last":makeId(34),"country":makeId(34)})
    }
    return data
}

// Helper function to generate string of length l
// @param l desired length
function generateString(l) {
    return makeId(l)
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
        window.onerror = (message, source, lineno, colno, error) => {
            log(`windowError fired with ${message}`, "red")
        }
        // Connect buttons
        document.getElementById('btnOpenSettings').addEventListener("click", onOpenSettings)
        document.getElementById('btnSaveSettings').addEventListener("click", onSaveSettings)
        document.getElementById('btnCancelSettings').addEventListener("click", onCancelSettings)
        document.getElementById('btnClear').addEventListener("click", onClear)
        document.getElementById('btnInsert10').addEventListener("click", () => { onInsert(10) })

        document.getElementById('btnRunTests').addEventListener("click", () => { onRunTest(10, settings.valueStart, settings.valueLength, settings.valueIncrement) })

        document.getElementById('btnReset').addEventListener("click", () => { onReset() })
        document.getElementById('btnDump').addEventListener("click", () => { onDump() })

//        document.getElementById('btnInsert100').addEventListener("click", () => { onInsert(100) })
//        document.getElementById('btnQueryAll1By1').addEventListener("click", () => { onQueryAll(1) })
//        document.getElementById('btnQueryAll10By10').addEventListener("click", () => { onQueryAll(10) })
//        document.getElementById('btnPresetDefault').addEventListener("click", () => { onPreset(presetDefault) })

        // Get store client
        storeClient = cordova.require("com.salesforce.plugin.smartstore.client")
        // Sets up soup - don't drop soup if it already exists
        setupSoup(false)
    })
}

main()
