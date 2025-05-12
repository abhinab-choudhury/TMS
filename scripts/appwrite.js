const { Client, Account, ID, Query, Databases, Permission, Role } = Appwrite;

const client = new Client();
client
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("681da58b000099a65422");

const account = new Account(client);
const databases = new Databases(client);

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
  } catch (error) {
    console.error("Update failed:", err);
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
