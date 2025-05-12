$(document).ready(function () {
  let current_user;
  account
    .get()
    .then((user) => {
      current_user = user;
      
      const urlParams = new URLSearchParams(window.location.search);
      const taskID = urlParams.get("id");

      if (taskID) {
        const taskPromise = databases.listDocuments(
          "681df8dd001c525ccaa1", // Database ID
          "68223ad40015babc2ab3", // Collection ID
          [Query.equal("$id", taskID)]
        );

        populateHTMLView(taskPromise, taskID);
      }
    })
    .catch((error) => {
      console.error("User not authenticated:", error);
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

  function populateHTMLView(promise, taskID) {
    promise.then((response) => {
      if (response.documents.length === 0) {
        console.warn("No task found with ID:", taskID);
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
      $("#startDateInput").val(new Date(task.start).toISOString().slice(0, 16));
      $("#endDateInput").val(new Date(task.end).toISOString().slice(0, 16));

      // Rich Text Description
      editor.setHTML(task.description);

      // Form submission logic
      $("#updateTaskForm").submit(function (e) {
        e.preventDefault();

        $("#submit-btn").html(`
          <i class="fa-solid fa-circle-notch fa-spin"></i> Updateing...
        `);

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
            taskID,
            updatedData
          )
          .then(() => {
            $.toast({
              heading: 'Success',
              text: 'Task updated successfully!',
              showHideTransition: 'slide',
              icon: 'success',
              position: 'top-right'
            });
          })
          .catch((err) => {
            console.error("Update failed:", err);
            $.toast({
              heading: 'Error',
              text: 'Failed to update task!',
              showHideTransition: 'fade',
              icon: 'error',
              position: 'top-right'
            });
          })
          .finally(() => {
            $("#submit-btn").html("Update Task");
          });
      });
    });
  }
});
