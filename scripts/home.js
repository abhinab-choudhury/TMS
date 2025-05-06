const today = new Date().toISOString().split("T")[0];
document.getElementById("startDateInput").setAttribute("min", today);
document.getElementById("endDateInput").setAttribute("min", today);
