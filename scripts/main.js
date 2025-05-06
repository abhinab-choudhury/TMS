let editorcfg = {}
editorcfg.toolbar = "basic";
const editor = new RichTextEditor("#rte", editorcfg)

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("d-none");
  sidebar.classList.add("d-block", "z-3", "position-absolute", "bg-white");
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("d-block", "z-3", "position-absolute", "bg-white");
  sidebar.classList.add("d-none");
}
