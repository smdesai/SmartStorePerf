// Constants
const SOUPNAME = "soup"
const SOUP_FEATURES = ["externalStorage"]
const INDEX_SPECS = [{path:"key", type:"String"}]

// Global variable
var storeClient

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

// Helper function to write output to screen
// @param msg to write out
function log(msg) {
    document.querySelector('#ulConsole').innerHTML += '<li class="table-view-cell"><div class="media-body">' + msg + '</div></li>'
}

// Function invoked when 'insert 1000' button is pressed
function onInsert1000() {
    alert("insert 1000")
}

// Function invoked when 'query all' button is pressed
function onQueryAll() {
    alert("Query all")
}


// main function
// Log in if needed
// Sets up soup if needed
function main() {
    force.login(
        function() {
            log("Auth succeeded") 
            // Connect buttons
            document.getElementById('btnInsert1000').addEventListener("click", onInsert1000)
            document.getElementById('btnQueryAll').addEventListener("click", onQueryAll)
            // Get store client
            storeClient = cordova.require("com.salesforce.plugin.smartstore.client")
            // Sets up soup
            setupSoup(storeClient)
                .then(exists => {
                    log("Verified that soup exists")
                })
        },
        function(error) {
            log("Auth failed: " + error) 
        }
    )
}

main()
