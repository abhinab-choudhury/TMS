const { Client, Account, ID, Query, Databases, Permission, Role } = Appwrite;

const client = new Client();
client
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("681da58b000099a65422");

const account = new Account(client);
const databases = new Databases(client);

async function signOut() {
  try {
    await account.deleteSession("current");
    $.toast({
      heading: "SignOut",
      text: "SignOut Successfull",
      showHideTransition: "fade",
      icon: "info",
    });
    window.location.href = "./../index.html";
  } catch (error) {
    $.toast({
      heading: "Failed",
      text: "SignOut Fasiled, Please try again",
      showHideTransition: "fade",
      icon: "error",
    });
  }
}

async function DeleteTask(taskID, event) {
  const button = event.target;
  button.disabled = true;
  button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

  try {
    await databases.deleteDocument(
      "681df8dd001c525ccaa1", // DB-ID
      "68223ad40015babc2ab3", // Collection-ID
      taskID
    );
    $.toast({
      heading: "Success",
      text: "Task deleted successfully!",
      showHideTransition: "slide",
      icon: "info",
      position: "top-right",
    });

    // Invalidate specific task detail cache
    if (typeof window.invalidateSpecificTaskDetailCache === 'function') {
      console.log(`Invalidating task detail cache for taskID: ${taskID} from appwrite.js`);
      window.invalidateSpecificTaskDetailCache(taskID);
    }

    // Invalidate all tasks list cache
    if (typeof window.invalidateAllTasksListCache === 'function') {
      console.log("Invalidating all tasks list cache from appwrite.js after delete");
      window.invalidateAllTasksListCache();
    }

    // Reload page if on all-tasks.html to reflect deletion
    if (window.location.pathname.includes("all-tasks.html")) {
      setTimeout(() => {
          window.location.reload();
      }, 1000); // Delay to allow toast to be seen
    }
  } catch (error) {
    console.error("Delete failed:", error); // Corrected from "Update failed:", err
    $.toast({
      heading: "Error",
      text: "Failed to delete task!",
      showHideTransition: "fade",
      icon: "error",
      position: "top-right",
    });
  } finally {
    button.disabled = false;
    button.innerHTML = "<i class='fa fa-trash'></i>";
  }
}
