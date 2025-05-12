$(document).ready(function () {
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

    if (category) {
      if (equalIgnoreCase(category, "work")) {
        let GetWorkCategoryPromise = databases.listDocuments(
          "681df8dd001c525ccaa1", // Database ID
          "68223ad40015babc2ab3", // Collection ID
          [
            Query.equal("user_id", current_user.$id),
            Query.equal("category", category)
          ]
        );
        PopularView(GetWorkCategoryPromise);
      } else if (equalIgnoreCase(category, "home")) {
        let GetHomeCategoryPromise = databases.listDocuments(
          "681df8dd001c525ccaa1", // Database ID
          "68223ad40015babc2ab3", // Collection ID
          [
            Query.equal("user_id", current_user.$id),
            Query.equal("category", category)
          ]
        );
        PopularView(GetHomeCategoryPromise);
      } else if (equalIgnoreCase(category, "personal")) {
        let GetPersonalCategoryPromise = databases.listDocuments(
          "681df8dd001c525ccaa1", // Database ID
          "68223ad40015babc2ab3", // Collection ID
          [
            Query.equal("user_id", current_user.$id),
            Query.equal("category", category)
          ]
        );
        PopularView(GetPersonalCategoryPromise);
      } else if(equalIgnoreCase(category, "urgent")) {
        let GetUrgentCategoryPromise = databases.listDocuments(
          "681df8dd001c525ccaa1", // Database ID
          "68223ad40015babc2ab3", // Collection ID
          [
            Query.equal("user_id", current_user.$id),
            Query.equal("category", category)
          ]
        );
        PopularView(GetUrgentCategoryPromise);
      }
    } else if (priority) {
      if (equalIgnoreCase(priority, "high")) {
        let GetHighPriorityPromise = databases.listDocuments(
          "681df8dd001c525ccaa1", // Database ID
          "68223ad40015babc2ab3", // Collection ID
          [
            Query.equal("user_id", current_user.$id),
            Query.equal("priority", priority)
          ]
        );
        PopularView(GetHighPriorityPromise);
      } else if (equalIgnoreCase(priority, "medium")) {
        let GetMediumPriorityPromise = databases.listDocuments(
          "681df8dd001c525ccaa1", // Database ID
          "68223ad40015babc2ab3", // Collection ID
          [
            Query.equal("user_id", current_user.$id),
            Query.equal("priority", priority)
          ]
        );
        PopularView(GetMediumPriorityPromise);
      } else if (equalIgnoreCase(priority, "low")) {
        let GetLowPriorityPromise = databases.listDocuments(
          "681df8dd001c525ccaa1", // Database ID
          "68223ad40015babc2ab3", // Collection ID
          [
            Query.equal("user_id", current_user.$id),
            Query.equal("priority", priority)
          ]
        );
        PopularView(GetLowPriorityPromise);
      }
    } else {
      let GetAllTasksPromise = databases.listDocuments(
        "681df8dd001c525ccaa1", // Database ID
        "68223ad40015babc2ab3", // Collection ID
        [Query.equal("user_id", current_user.$id)]
      );

      PopularView(GetAllTasksPromise);
    }
  }

  function PopularView(Promise) {
    let TasksView = $("#tasks-view");
    TasksView.empty();

    TasksView.html(`
        <div class="d-flex justify-content-center align-items-center mx-auto" style="height: 100vh;">
          <i class="fa-solid fa-circle-notch fa-spin fa-3x"></i>
        </div>  
      `);
    Promise.then(function (response) {
      TasksView.empty();

      if(response.documents.length !== 0) {
        response.documents.forEach((element, idx) => {
          console.log("Element : " + idx + " : " + element.title);
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
              DeleteTask(element.$id, event);
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
    });
  }
});
