// Cache Helper Functions
const DEFAULT_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
var appwriteCache = appwriteCache || {}; // Use var for global, or ensure it's initialized once

function setCache(key, data, durationInMs = DEFAULT_CACHE_DURATION_MS) {
  if (typeof key !== 'string') {
    console.error("Cache key must be a string.");
    return;
  }
  appwriteCache[key] = {
    data: data,
    expiry: Date.now() + durationInMs,
  };
  // console.log(`Cache set for key: ${key}`);
}

function getCache(key) {
  if (typeof key !== 'string') {
    console.error("Cache key must be a string.");
    return null;
  }
  const item = appwriteCache[key];
  if (item) {
    if (Date.now() < item.expiry) {
      // console.log(`Cache hit for key: ${key}`);
      return item.data;
    } else {
      // console.log(`Cache expired for key: ${key}. Removing.`);
      delete appwriteCache[key]; // Remove expired item
    }
  } else {
    // console.log(`Cache miss for key: ${key}`);
  }
  return null;
}

function invalidateCache(key) {
  if (typeof key !== 'string') {
    console.error("Cache key must be a string.");
    return;
  }
  // console.log(`Cache invalidated for key: ${key}`);
  delete appwriteCache[key];
}

function invalidateAllAppwriteCache() {
  // console.log("Invalidating all Appwrite cache.");
  appwriteCache = {};
}
window.invalidateAllTasksListCache = invalidateAllAppwriteCache;
// End of Cache Helper Functions

$(document).ready(function () {
  let isRequestInProgress = false;
  let current_user;
  account
    .get()
    .then((user) => {
      current_user = user;
      handleURLParams(current_user);
    })
    .catch((error) => {
      console.error(error);
      $.toast({
        heading: "Signed Out",
        text: "Session expired or not found. Redirecting to sign in.",
        showHideTransition: "fade",
        icon: "info",
      });
      setTimeout(() => {
        window.location.href = "./../signin.html";
      }, 3000);      
    });

  function handleURLParams(current_user) {
    const urlParams = new URLSearchParams(window.location.search);
    console.log("URL Params: ", urlParams.toString());

    const category = urlParams.get("category");
    const priority = urlParams.get("priority");
    let cacheKey;
    let apiCallPromise;

    // Define specific queries for listDocuments
    const dbId = "681df8dd001c525ccaa1";
    const collectionId = "68223ad40015babc2ab3";

    if (category) {
      cacheKey = `tasks_category_${category.toLowerCase()}_user_${current_user.$id}`;
      const cachedResponse = getCache(cacheKey);
      if (cachedResponse) {
        console.log(`Using cached data for ${cacheKey}`);
        PopularView(Promise.resolve(cachedResponse));
        return;
      }
      if (isRequestInProgress) {
        console.log("Request already in progress. Skipping new API call for key:", cacheKey);
        return;
      }
      isRequestInProgress = true;

      apiCallPromise = databases.listDocuments(
        dbId,
        collectionId,
        [Query.equal("user_id", current_user.$id), Query.equal("category", category)]
      );
    } else if (priority) {
      cacheKey = `tasks_priority_${priority.toLowerCase()}_user_${current_user.$id}`;
      const cachedResponse = getCache(cacheKey);
      if (cachedResponse) {
        console.log(`Using cached data for ${cacheKey}`);
        PopularView(Promise.resolve(cachedResponse));
        return;
      }
      if (isRequestInProgress) {
        console.log("Request already in progress. Skipping new API call for key:", cacheKey);
        return;
      }
      isRequestInProgress = true;

      apiCallPromise = databases.listDocuments(
        dbId,
        collectionId,
        [Query.equal("user_id", current_user.$id), Query.equal("priority", priority)]
      );
    } else {
      // Get all tasks
      cacheKey = `tasks_all_user_${current_user.$id}`;
      const cachedResponse = getCache(cacheKey);
      if (cachedResponse) {
        console.log(`Using cached data for ${cacheKey}`);
        PopularView(Promise.resolve(cachedResponse));
        return;
      }
      if (isRequestInProgress) {
        console.log("Request already in progress. Skipping new API call for key:", cacheKey);
        return;
      }
      isRequestInProgress = true;

      apiCallPromise = databases.listDocuments(
        dbId,
        collectionId,
        [Query.equal("user_id", current_user.$id)]
      );
    }

    if (apiCallPromise) {
      apiCallPromise
        .then(response => {
          if (response && typeof response.documents !== 'undefined') {
            // Ensure cacheKey is defined (it should be if apiCallPromise is defined)
            if (cacheKey) {
              setCache(cacheKey, response);
            } else {
              console.error("cacheKey is undefined, cannot set cache.");
            }
          }
        })
        .catch(error => {
          // cacheKey might be undefined if the logic path to define it was missed.
          const errorCacheKey = cacheKey || "unknown_key";
          console.error(`Error during API call for caching key ${errorCacheKey}:`, error);
        });
      PopularView(apiCallPromise);
    } else {
      // This case implies neither category, priority, nor 'all tasks' logic path was taken,
      // which shouldn't happen with the current if/else if/else structure for apiCallPromise.
      // However, if it somehow did, and we didn't return from cache, reset the flag.
      isRequestInProgress = false;
      console.warn("No API call was made due to unhandled parameter combination or logic error.");
      // Display a generic message or error.
      let TasksView = $("#tasks-view");
      TasksView.empty();
      TasksView.html(`
          <div class="d-flex justify-content-center align-items-center mx-auto" style="height: 100%;">
            <span class="fw-light">Could not determine tasks to load.</span>
          </div>
        `);
    }
  }

  function PopularView(apiPromise) { // Renamed parameter for clarity
    let TasksView = $("#tasks-view");
    TasksView.empty();

    TasksView.html(`
        <div class="d-flex justify-content-center align-items-center mx-auto" style="height: 100vh;">
          <i class="fa-solid fa-circle-notch fa-spin fa-3x"></i>
        </div>  
      `);
    apiPromise.then(function (response) { // Changed from 'Promise' to 'apiPromise'
      TasksView.empty();

      if(response.documents.length !== 0) {
        response.documents.forEach((element, idx) => {
          // console.log("Element : " + idx + " : " + element.title); // Kept for debugging if needed
          const CardTitle = $("<h5>")
            .addClass("card-title")
            .html(`<span class="fw-bold">Title : </span> ${element.title}`);
  
          const StatesBadge = $("<span>")
            .addClass(
              "badge bg-secondary-subtle border border-secondary-subtle text-secondary-emphasis rounded-pill"
            )
            .text(element.status);
  
          const PriorityBadge = $("<span>")
            .addClass(
              "badge bg-secondary-subtle border border-secondary-subtle text-secondary-emphasis rounded-pill"
            )
            .text(element.priority);
  
          const CategoryBadge = $("<span>")
            .addClass(
              "badge bg-secondary-subtle border border-secondary-subtle text-secondary-emphasis rounded-pill"
            )
            .text(element.category);
  
          const StatesDiv = $("<div>")
            .addClass("d-flex gap-2 my-2")
            .append(StatesBadge, PriorityBadge, CategoryBadge);
  
          const DetailPageLink = $("<a>")
            .attr("href", `./task-details.html?id=${element.$id}`)
            .addClass("card-link")
            .text("Task Description");
  
          const DeleteTaskBtn = $("<button>")
            .addClass("btn btn-danger d-flex ms-auto p-2")
            .html("<i class='fa fa-trash'></i>") 
            .on('click', function(event) {
              // Make sure DeleteTask is defined, possibly globally or imported if modules are used
              // For now, assuming DeleteTask is available in the global scope or same script
              if (typeof DeleteTask === 'function') {
                DeleteTask(element.$id, event);
              } else {
                console.error('DeleteTask function is not defined.');
                alert('Error: Delete functionality is not available.');
              }
              // Example of cache invalidation after delete:
              // This needs to be more specific if possible, or a full clear
              // For now, clearing all task-related cache seems safest until more specific keys for deletion are handled
              // invalidateAllAppwriteCache();
              // Or, if DeleteTask handles its own cache invalidation:
              // console.log("Task deletion initiated. Cache invalidation might be handled by DeleteTask or require manual refresh.");
            });

          const TaskBody = $("<div>");
          TaskBody.attr("class", "class-body");
          TaskBody.append([CardTitle, StatesDiv, DetailPageLink, DeleteTaskBtn]);
  
          const TaskCard = $("<div>")
            .attr("id", "task-detail-card")
            .addClass("card p-2 m-2")
            .append(TaskBody);
  
          TasksView.append(TaskCard);
        });
      } else {
        TasksView.html(`
          <div class="d-flex justify-content-center align-items-center mx-auto" style="height: 100%;">
            <span class="fw-light">No Task Found</span>
          </div>  
        `);
      }
    }).catch(function (error) {
      console.error("Error Fetching Documents:", error);
      $.toast({
        heading: "Error",
        text: error.message || "Failed to get tasks. Please try again.",
        icon: "error",
        showHideTransition: "fade",
        position: "top-right",
      });
    }).finally(function () {
      isRequestInProgress = false;
      console.log("Request finished. isRequestInProgress set to false.");
    });
  }
});
