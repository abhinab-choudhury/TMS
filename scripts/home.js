$(document).ready(function () {

  let current_user;
  account
    .get()
    .then((user) => {
      current_user = user;
          })
    .catch((error) => {
      window.location.href = "signin.html";
      $.toast({
        heading: "Signed Out",
        text: "Session expired or not found. Redirecting to sign in.",
        showHideTransition: "fade",
        icon: "info",
      });
    });
  
  $("#createTaskForm").on("submit", async function (event) {
    event.preventDefault();
    
    console.log("Submit Button Clicked...");
    
    const taskStatus = $("#floatingTaskStatus").val();
    const taskDescription = editor.getHTMLCode();
    const taskName = $("#taskName").val();
    const category = $("#categorySelect").val();
    const priority = $("#prioritySelect").val();
    const startDate = $("#startDateInput").val();
    const endDate = $("#endDateInput").val();
  

    console.log(`
      {
        title: ${taskName},
        description: ${taskDescription},
        status: ${taskStatus.toLowerCase()},
        category: ${category.toLowerCase()},
        priority: ${priority.toLowerCase()},
        start: ${startDate},
        end: ${endDate},
        user_id: ${current_user.$id},
      }  
    `)
    const promise = databases.createDocument(
      "681df8dd001c525ccaa1", // DB
      "68223ad40015babc2ab3", // COLLECTION
      ID.unique(),
      {
        title: taskName,
        description: taskDescription,
        status: taskStatus.toLowerCase(),
        category: category.toLowerCase(),
        priority: priority.toLowerCase(),
        start: startDate,
        end: endDate,
        user_id: current_user.$id,
      }
    );
  
    $("#submit-btn").html(`
      <i class="fa-solid fa-circle-notch fa-spin"></i> Creating...
    `);
    
    promise
      .then(function (response) {
        console.log("Document created:", response);
        $.toast({
          heading: "Task Created",
          text: "Your task was created successfully.",
          icon: "success",
          showHideTransition: "slide",
          position: "top-right",
        });
      })
      .catch(function (error) {
        console.error("Error creating document:", error);
        $.toast({
          heading: "Error",
          text: error.message || "Failed to create task. Please try again.",
          icon: "error",
          showHideTransition: "fade",
          position: "top-right",
        });
      })
      .finally(function () {
        $("#submit-btn").html("Create Task");
        $("#taskName").val("");
        editor.setHTMLCode("");
        $("#floatingTaskStatus").val($("#floatingTaskStatus option:first-child").val());
        $("#categorySelect").val($("#categorySelect option:first-child").val());  
        $("#prioritySelect").val($("#prioritySelect option:first-child").val());
        $("#startDateInput").val("");
        $("#endDateInput").val("");
      });    
  });
})
