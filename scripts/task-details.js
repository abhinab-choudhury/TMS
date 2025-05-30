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
  // console.log("Invalidating all Appwrite cache (task-details context).");
  appwriteCache = {};
}
window.invalidateSpecificTaskDetailCache = invalidateCache;
// End of Cache Helper Functions

$(document).ready(function () {
  let isFetchRequestInProgress = false;
  let isUpdateRequestInProgress = false;
  let current_user;

  account
    .get()
    .then((user) => {
      current_user = user;
      
      const urlParams = new URLSearchParams(window.location.search);
      const taskID = urlParams.get("id");

      if (taskID) {
        const cacheKey = taskID; // Use taskID as the cache key for individual task details
        const cachedTaskData = getCache(cacheKey);

        if (cachedTaskData) {
          console.log("Using cached task details for task ID:", taskID, cachedTaskData);
          // populateHTMLView expects a promise that resolves to an object like { documents: [task] }
          // The 'taskID' parameter to populateHTMLView is used for update submission, so it's still needed.
          populateHTMLView(Promise.resolve({ documents: [cachedTaskData] }), taskID);
          return; // Skip API call
        }

        if (isFetchRequestInProgress) {
          console.log("Fetch request for task details already in progress. Skipping new API call for task ID:", taskID);
          return;
        }
        isFetchRequestInProgress = true; // Set flag here for actual API call

        const taskPromise = databases.listDocuments(
          "681df8dd001c525ccaa1", // Database ID
          "68223ad40015babc2ab3", // Collection ID
          [Query.equal("$id", taskID)]
        );

        // Add .then() to cache the result before populateHTMLView gets it
        taskPromise.then(response => {
          if (response && response.documents && response.documents.length > 0) {
            setCache(cacheKey, response.documents[0]); // Cache the individual task object
          } else if (response && response.documents && response.documents.length === 0) {
            // Optionally cache "not found" for a short period if desired
            // console.log("Task not found, not caching 'not found' state for task ID:", taskID);
          }
        }).catch(error => {
          console.error("Error during API call for task details caching (task ID:", taskID, "):", error);
        });

        populateHTMLView(taskPromise, taskID);
      } else {
        // No taskID in URL, perhaps show an error or redirect
        console.error("No task ID found in URL.");
        // Optionally, update UI to show an error message
        $("#task-details-container").html("<p class='text-danger'>No task ID provided in the URL.</p>");
      }
    })
    .catch((error) => {
      console.error("User not authenticated or other error:", error);
      $.toast({
        heading: "Signed Out",
        text: "Session expired or not found. Redirecting to sign in.",
        showHideTransition: "fade",
        icon: "info",
      });
      setTimeout(() => {
        window.location.href = "./../signin.html";
      }, 2000);
    });

  function populateHTMLView(promise, taskID) { // taskID is passed for the update form submission
    promise
      .then((response) => {
        if (response.documents.length === 0) {
          console.warn("No task found with ID:", taskID);
          $("#task-details-container").html("<p class='text-warning'>Task not found.</p>");
          return;
        }

        const task = response.documents[0];

        // Set text values
        $("#title-heading").text(`Task - ${task.title}`);
        $("#titleId-heading").text(`ID : ${task.$id}`);
        $("#taskName").val(task.title);
        $("#floatingTaskStatus").val(task.status);
        $("#categorySelect").val(task.category);
        $("#prioritySelect").val(task.priority);
        // Ensure task.start and task.end are valid date strings for new Date()
        if (task.start) {
            $("#startDateInput").val(new Date(task.start).toISOString().slice(0, 16));
        }
        if (task.end) {
            $("#endDateInput").val(new Date(task.end).toISOString().slice(0, 16));
        }


        // Rich Text Description
        if (editor && typeof editor.setHTML === 'function') {
            editor.setHTML(task.description);
        } else {
            console.error("Quill editor not initialized or setHTML not available.");
        }


        // Form submission logic
        $("#updateTaskForm").off('submit').on('submit', function (e) { // Use .off().on() to prevent multiple bindings if populateHTMLView is ever called multiple times
          if (isUpdateRequestInProgress) {
            console.log("Update request already in progress. Preventing new update.");
            $.toast({
              heading: 'Busy',
              text: 'An update is already in progress. Please wait.',
              showHideTransition: 'fade',
              icon: 'info',
              position: 'top-right'
            });
            return;
          }
          isUpdateRequestInProgress = true;
          e.preventDefault();

          $("#submit-btn").html(
            `<i class="fa-solid fa-circle-notch fa-spin"></i> Updating...`
          ).prop('disabled', true);

          const updatedData = {
            title: $("#taskName").val(),
            status: $("#floatingTaskStatus").val(),
            category: $("#categorySelect").val(),
            priority: $("#prioritySelect").val(),
            start: $("#startDateInput").val(),
            end: $("#endDateInput").val(),
            description: editor.getHTML(),
          };

          databases
            .updateDocument(
              "681df8dd001c525ccaa1", // DB ID
              "68223ad40015babc2ab3", // Collection ID
              taskID, // taskID from the closure of populateHTMLView
              updatedData
            )
            .then((updatedDocument) => {
              $.toast({
                heading: 'Success',
                text: 'Task updated successfully!',
                showHideTransition: 'slide',
                icon: 'success',
                position: 'top-right'
              });
              // Update cache with the new document data
              // The response from updateDocument is the updated document itself.
              setCache(taskID, updatedDocument);
              console.log("Task details cache updated for task ID:", taskID);

              if (typeof window.invalidateAllTasksListCache === 'function') {
                console.log("Invalidating all tasks list cache from task-details.js");
                window.invalidateAllTasksListCache();
              }
            })
            .catch((err) => {
              console.error("Update failed:", err);
              $.toast({
                heading: 'Error',
                text: 'Failed to update task! ' + (err.message || ""),
                showHideTransition: 'fade',
                icon: 'error',
                position: 'top-right'
              });
            })
            .finally(() => {
              isUpdateRequestInProgress = false;
              console.log("Update request finished. isUpdateRequestInProgress set to false.");
              $("#submit-btn").html("Update Task").prop('disabled', false);
            });
        });
      })
      .catch((error) => {
        console.error("Error processing task details in populateHTMLView:", error);
        $("#task-details-container").html("<p class='text-danger'>Error loading task details.</p>");
        $.toast({
          heading: "Error",
          text: "Failed to load task details. " + (error.message || ""),
          showHideTransition: "fade",
          icon: "error",
          position: "top-right",
        });
      })
      .finally(() => {
        isFetchRequestInProgress = false;
        console.log("Fetch request finished. isFetchRequestInProgress set to false.");
      });
  }
});
