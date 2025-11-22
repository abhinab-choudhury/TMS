
## 🗂️ TMS - Task Management System
<img width="1723" height="915" alt="image" src="https://github.com/user-attachments/assets/7657cd97-7fc7-4305-9982-edb0099761bd" />

A full-featured web-based task management solution built entirely using HTML, CSS, and JS


### 📌 **Project Objective**

TMS (Task Management System) is a browser-based application designed to help individuals and teams **create**, **track**, **update**, and **delete tasks** efficiently. It enables users to organize their work with rich formatting, deadlines, priorities, and attachments in a seamless, user-friendly interface.

---

### 🛠️ **Technologies Used**

#### 🔧 Frontend Stack

* **HTML5**: Semantic structure and layout of the application.
* **CSS3** (Inline + Bootstrap): For responsive design, visual aesthetics, and utility classes.
* **Bootstrap 5**: Used for grid system, UI components like modals, buttons, alerts, and form styling.
* **jQuery**: DOM manipulation, event handling, animations, and AJAX calls for smooth interactivity.
* **RichTextEditor.js**: Enables users to write detailed task descriptions with formatting (bold, links, images, lists, etc.).

#### 🧠 Backend (BaaS)

* **Appwrite**:

  * **Authentication**: Account management and user sessions.
  * **Database**: Stores all task-related information including titles, descriptions, dates, and priority.
  * **Permissions**: Role-based access control (RBAC) using Appwrite's built-in Permission and Role APIs.
  * **API Client SDK**: All interactions with the Appwrite server (creating, reading, updating, deleting documents) are done through the official Appwrite JavaScript SDK.

---

### 💡 Key Features

* ✅ **Task CRUD Operations**
  * Add task with title, description (rich text), due date, and priority.
  * View tasks in a styled card layout.
  * Update existing tasks with live previews.
  * Delete tasks with confirmation and toast feedback.

* 🖋️ **Rich Description Support**
  * Thanks to the RichTextEditor, users can format task details with headings, bold, italics, links, and embedded media.

* 🛠️ **AJAX-Based Interactions**
  * Uses jQuery to fetch, post, and update task data without reloading the page.

* 📦 **Appwrite Integration**
  * Fully powered backend for document handling, user accounts, authentication, and permission layers.

* 📱 **Mobile Responsive**
  * Designed with Bootstrap and inline styles to ensure responsiveness across mobile, tablet, and desktop.

* 🔐 **User Authentication**
  * Secure login/logout via Appwrite's Account API ensures task data is user-specific and protected.

* 🎨 **Toast Notifications**
  * Uses `jquery.toast` to display success/error messages on actions like saving or deleting tasks.

> Note: 4th-sem minor-project | 2025
