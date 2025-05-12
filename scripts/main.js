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

function equalIgnoreCase(str1, str2) {
  return str1.toLowerCase() === str2.toLowerCase();
}