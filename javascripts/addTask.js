let priority;
let assignedContacts = [];
let selectedCategory;
let subtaskID = 0;
let remoteCategoryAsJSON;

/**
 * initializes the AddTask Page
 */
async function initAddTask() {
  remoteTasksAsJSON = await getRemoteData("tasksRemote");
  remoteCategoryAsJSON = await getRemoteData("categoryRemote");
  addContactNamesToAssignedTo();
  addCategories();
  addSubtaskEventListener();
}

/**
 * Sets the priority for the task and updates the UI accordingly.
 * @param {string} prio - The priority value ("urgent", "medium", or "low").
 */
function setPrio(prio) {
  const priorityValues = ["urgent", "medium", "low"];
  for (const value of priorityValues) {
    const element = document.getElementById(value);
    const iconElement = document.getElementById(`${value}Icon`);
    const iconSuffix = value === prio ? "_white" : "";
    element.classList.toggle(value, value === prio);
    iconElement.src = `assets/icons/${value}${iconSuffix}.png`;
  }
  priority = prio;
}

/**
 * Adds contact names to the "Assigned To" dropdown in the add task form.
 */
function addContactNamesToAssignedTo() {
  document.getElementById("selectContactDropdown").innerHTML = "";
  for (let i = 0; i < contacts.length; i++) {
    let contact = contacts[i];
    let name = contact.name;
    document.getElementById("selectContactDropdown").innerHTML += `
    <div id="assignedContactID${i}" onclick="selectOptionContacts(${i}), pushAssignedContact(${i})" class="option sb">${name} </div>`;
  }
}

/**
 * Adds categories to the "Category" dropdown in the add task form.
 */
async function addCategories() {
  document.getElementById("categoryDropdown").innerHTML = `<div class="option" onclick="showNewCategory()">
    New Category 
  </div>`;
  for (let i = 0; i < remoteCategoryAsJSON.length; i++) {
    let category = remoteCategoryAsJSON[i];
    let name = category["name"];
    let color = category["color"];
    name = name.charAt(0).toUpperCase() + name.slice(1);
    document.getElementById("categoryDropdown").innerHTML += genCategoryHTML(i, name, color);
  }
}

/**
 * Generates the HTML representation for a category in the dropdown.
 * @param {number} i - Index of the category in the list.
 * @param {string} name - Category name.
 * @param {string} color - Category color.
 * @returns {string} The HTML code representing a category in the dropdown.
 */
function genCategoryHTML(i, name, color) {
  return `
<div onclick="selectOptionCategory(${i})" class="option">
  <div class="d-option">
    ${name}
    <div style="background-color: ${color}" class="category-circle"></div>
  </div>
  <img onclick="removeCategory(event, ${i})" src="assets/icons/clear-subtask.png">  
</div>`;
}

/**
 * Pushes an assigned contact to the assignedContacts array.
 * @param {number} i - Index of the selected contact in the contacts array.
 */
function pushAssignedContact(i) {
  let contact = contacts[i];
  let index = assignedContacts.indexOf(contact);
  if (index <= -1 && assignedContacts.length < 5) {
    assignedContacts.push(contacts[i]);
  }
}

/**
 * Creates a new task and saves it to the remote tasks list.
 * @param {string} status - The status of the task ("todo", "inProgress", or "done").
 * @returns {Promise<void>}
 */
async function createTask(status) {
  let title = document.getElementById("addTaskTitle");
  let description = document.getElementById("addTaskDescription");
  let dueDate = document.getElementById("date");
  if (selectedCategory == "" || assignedContacts == "" || !priority) {
    taskPopup(alert);
  } else {
    let newTask = generateNewTask(title, description, dueDate, status);
    remoteTasksAsJSON.push(newTask);
    await setItem("tasksRemote", remoteTasksAsJSON);
    subtaskID = 0;
    resetValues(dueDate, description, title);
    taskPopup();
    boardCondition();
  }
}

/**
 * Generates a new task object.
 *
 * @param {HTMLInputElement} title - The input element for task title.
 * @param {HTMLInputElement} description - The input element for task description.
 * @param {HTMLInputElement} dueDate - The input element for task due date.
 * @param {string} status - The status of the task ("todo", "inProgress", or "done").
 * @returns {Object} The newly generated task object.
 */
function generateNewTask(title, description, dueDate, status) {
  let newTask = {
    title: title.value,
    description: description.value,
    status: status,
    category: selectedCategory,
    priority: priority,
    subtasks: pushSubtasks(),
    dueDate: dueDate.value,
    assignedTo: assignedContacts,
  };
  return newTask;
}

/**
 * Handles the redirection after adding a task, and resets the form values.
 */
function boardCondition() {
  if (window.location.pathname.includes("add_task.html")) {
    setTimeout(() => {
      window.location.href = "board.html";
    }, 1000);
  }
  if (window.location.pathname.includes("board.html")) {
    initBoard();
    closeSlideInBtn();
  }
}

/**
 * Resets the form values after a task is added or canceled.
 * @param {HTMLInputElement} dueDate - The input element for the task's due date.
 * @param {HTMLTextAreaElement} description - The textarea element for the task's description.
 * @param {HTMLInputElement} title - The input element for the task's title.
 */
function resetValues(dueDate, description, title) {
  let category = document.getElementById("addTaskCategory");
  let assignedTo = document.getElementById("chosenContacts");
  let subtaskContainer = document.getElementById("subtaskContainer");
  priority = "";
  let elem = document.querySelectorAll(".prio-btn");
  for (let k = 0; k < elem.length; k++) {
    elem[k].classList.remove("urgent", "medium", "low");
    document.getElementById("mediumIcon").src = "assets/icons/medium.png";
    document.getElementById("urgentIcon").src = "assets/icons/urgent.png";
    document.getElementById("lowIcon").src = "assets/icons/low.png";
  }
  emptyTaskFields(title, description, dueDate, category, assignedTo, subtaskContainer);
}

/**
 * Clears the task-related fields and UI elements.
 *
 * @param {HTMLInputElement} title - The input element for the task's title.
 * @param {HTMLTextAreaElement} description - The textarea element for the task's description.
 * @param {HTMLInputElement} dueDate - The input element for the task's due date.
 * @param {HTMLSelectElement} category - The select element for the task's category.
 * @param {HTMLElement} assignedTo - The element for displaying assigned contacts.
 * @param {HTMLElement} subtaskContainer - The element for displaying subtasks.
 */
function emptyTaskFields(title, description, dueDate, category, assignedTo, subtaskContainer) {
  title.value = "";
  description.value = "";
  dueDate.value = "";
  category.innerHTML = "Select task category";
  assignedTo.innerHTML = "";
  subtaskContainer.innerHTML = "";
  assignedContacts = [];
  selectedCategory = [];
}

//-----------dropdown-category --------------------//
/**
 * Opens the category dropdown in the add task form.
 */
function openDropdownCategory() {
  let dropdown = document.getElementById("categoryDropdown");
  let category = document.getElementById("addTaskCategory");
  dropdown.classList.toggle("expanded");
  category.classList.toggle("category-expanded");
}

/**
 * Selects a category from the dropdown and updates the selectedCategory.
 * @param {number} i - Index of the selected category in the remoteCategoryAsJSON array.
 */
function selectOptionCategory(i) {
  let dropdown = document.getElementById("categoryDropdown");
  let category = document.getElementById("addTaskCategory");
  let selectedOption = event.target.innerHTML;
  category.innerHTML = selectedOption;
  selectedCategory = remoteCategoryAsJSON[i]["name"];
  dropdown.classList.remove("expanded");
  category.classList.remove("category-expanded");
}

/**
 * Displays the "New Category" input and hides the category dropdown temporarily.
 */
function showNewCategory() {
  let selectCat = document.getElementById("addTaskCategory");
  let newCat = document.getElementById("newCat");
  let dropdown = document.getElementById("categoryDropdown");
  selectCat.classList.add("d-none");
  newCat.classList.remove("d-none");
  dropdown.classList.add("d-none");
  renderColors();
}

/**
 * Closes the "New Category" input and displays the category dropdown again.
 */
function closeNewCategory() {
  let selectCat = document.getElementById("addTaskCategory");
  let newCat = document.getElementById("newCat");
  let dropdown = document.getElementById("categoryDropdown");
  selectCat.classList.remove("d-none");
  newCat.classList.add("d-none");
  dropdown.classList.remove("d-none");
  document.getElementById("newCatInput").value = "";
}

/**
 * Renders the color options for creating a new category.
 */
function renderColors() {
  let colorContainer = document.getElementById("newCatColors");
  colorContainer.innerHTML = "";
  for (let i = 0; i < nameColor.length; i++) {
    let color = nameColor[i];
    colorContainer.innerHTML += `
    <div id="newCatColorID${i}" onclick="selectCatColor(${i})" style="background-color: ${color}" class="newCatColor"></div>`;
  }
}

/**
 * Selects a color for the new category when creating it.
 * @param {number} i - Index of the selected color in the nameColor array.
 */
function selectCatColor(i) {
  let newColor = document.getElementById(`newCatColorID${i}`);
  let allColors = document.querySelectorAll(".newCatColor");
  for (let j = 0; j < allColors.length; j++) {
    allColors[j].classList.remove("selectedColor");
  }
  newColor.classList.add("selectedColor");
}

/**
 * Adds a new category to the remote category list.
 * Retrieves the new category name and color from the input fields.
 * @returns {Promise<void>}
 */
async function addNewCategory() {
  let newCatInp = document.getElementById("newCatInput");
  let newColorElement = document.querySelector(".selectedColor");
  let newColor = newColorElement ? newColorElement.style.backgroundColor : null;
  let newCat = newCatInp.value;
  newCat = newCat.charAt(0).toUpperCase() + newCat.slice(1);
  if (newCat && newColor) {
    pushNewCat();
  }
  addCategories();
  closeNewCategory();
}

/**
 * Pushes a new category object to the remote category list.
 *
 * @param {string} newCat - The name of the new category.
 * @param {string} newColor - The color of the new category.
 * @returns {Promise<void>}
 */
async function pushNewCat() {
  let newCategory = {
    name: newCat,
    color: newColor,
  };
  remoteCategoryAsJSON.push(newCategory);
  await setItem("categoryRemote", remoteCategoryAsJSON);
}

/**
 * Removes a category from the remote category list and updates the UI.
 * @param {Event} event - The event object from the click event.
 * @param {number} i - Index of the category to be removed in the remoteCategoryAsJSON array.
 * @returns {Promise<void>}
 */
async function removeCategory(event, i) {
  event.stopPropagation();

  remoteCategoryAsJSON.splice(i, 1);
  await setItem("categoryRemote", remoteCategoryAsJSON);
  document.getElementById("addTaskCategory").innerHTML = "Select task category";
  addCategories();
}

//-----------dropdown-category --------------------//
//-----------dropdown-contacts --------------------//

/**
 * Opens the contacts dropdown in the add task form.
 */
function openDropdownContacts() {
  let dropdown = document.getElementById("selectContactDropdown");
  let selectContact = document.getElementById("selectContact");
  dropdown.classList.toggle("expanded");
  selectContact.classList.toggle("category-expanded");
}

/**
 * Selects a contact from the dropdown and adds it to the chosen contacts list.
 * @param {number} i - Index of the selected contact in the contacts array.
 */
function selectOptionContacts(i) {
  const dropdown = document.getElementById("selectContactDropdown");
  const chosenContacts = document.getElementById("chosenContacts");
  const assignedContact = document.getElementById(`assignedContactID${i}`);
  const { name, color } = contacts[i];
  const initials = getInitials(name);
  if (!isContactSelected(chosenContacts, contacts[i]) && chosenContacts.children.length < 5) {
    assignedContact.classList.add("d-none");
    chosenContacts.innerHTML += `<div style="background-color: ${color}" class="chosenContactInitials" onclick="removeContact(${i})">${initials}</div>`;
    const selectedOption = dropdown.querySelector(`option[value="${i}"]`);
    if (selectedOption !== null) {
      selectedOption.remove();
    }
  }
  dropdown.classList.remove("expanded");
}


/**
 * Checks if a contact is already selected in the chosen contacts list.
 * @param {HTMLElement} chosenContacts - The container for the chosen contacts.
 * @param {Object} contact - The selected contact object.
 * @returns {boolean} True if the contact is already selected, false otherwise.
 */
function isContactSelected(chosenContacts, contact) {
  let contactElements = chosenContacts.getElementsByClassName("chosenContactInitials");

  for (let i = 0; i < contactElements.length; i++) {
    let initials = contactElements[i].textContent.trim();
    if (initials === getInitials(contact["name"])) {
      return true;
    }
  }

  return false;
}

//-----------dropdown-contacts ------------------------//
//-----------remove added contacts --------------------//

/**
 * Removes a contact from the chosen contacts list and updates the UI.
 * @param {number} i - Index of the contact to be removed in the contacts array.
 */
function removeContact(i) {
  const dropdown = document.getElementById("selectContactDropdown");
  const contact = contacts[i];
  const assignedContactID = `assignedContactID${i}`;
  const contactName = contact.name;
  const contactIndex = assignedContacts.indexOf(contact);
  assignedContacts.splice(contactIndex, 1);
  if (!dropdown.querySelector(`#${assignedContactID}`)) {
    dropdown.innerHTML += `<div id="${assignedContactID}" onclick="selectOptionContacts(${i})" class="option sb">${contactName}</div>`;
  }
  removeFromChosenContacts(i);
  recoverAssignedContact(assignedContactID);
}


/**
 * Removes a contact from the chosen contacts list UI.
 * @param {number} i - Index of the contact to be removed in the contacts array.
 * @param {string} contactName - Name of the contact to be removed.
 */
function removeFromChosenContacts(i) {
  let chosenContacts = document.getElementById("chosenContacts");
  let chosenContact = chosenContacts.querySelector(`.chosenContactInitials[onclick*="removeContact(${i})"]`);
  if (chosenContact) {
    chosenContact.remove();
  }
}

/**
 * Recovers an assigned contact option in the contacts dropdown.
 * @param {string} assignedContactID - The ID of the assigned contact to be recovered in the selectContactDropdown.
 */
function recoverAssignedContact(assignedContactID) {
  let assignedContact = document.getElementById(assignedContactID);
  if (assignedContact) {
    assignedContact.classList.remove("d-none");
  }
}

/**
 * Removes a contact from the assigned contacts list when the contact is deleted from contacts.
 * @param {number} i - Index of the deleted contact in the contacts array.
 */
function deleteFromAssignedContacts(i) {
  let contactName = contacts[i]["name"];
  let index = assignedContacts.findIndex((obj) => obj.name === contactName);
  if (index > -1) {
    assignedContacts.splice(index, 1);
  }
}

//-------------task successfully added----------------//
/**
 * Displays a popup message to indicate successful task creation or missing information.
 * @param {string} change - The type of change: 'alert' or undefined (task successfully added).
 */
function taskPopup(change) {
  let success = document.getElementById("taskAdded");
  if (change == alert) {
    success.innerHTML = `Please fill missing informations`;
  } else {
    success.innerHTML = `Task added to board &nbsp; <img src="assets/icons/board-icon.svg" />`;
  }
  success.style.display = "block";
  setTimeout(function () {
    success.style.display = "none";
  }, 2000);
}
//-------------task successfully added----------------//

//-------------setting min date to today----------------//
/**
 * Sets the minimum date for the "Due Date" input field to today.
 */
function setMinDate() {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let minMonth = `0${month}`;
  let day = date.getDate();
  let minDay = `0${day}`;
  let today = document.getElementById("date");
  if (month < 10) {
    month = minMonth;
  }
  if (day < 10) {
    day = minDay;
  }
  today.min = `${year}-${month}-${day}`;
}
//-------------setting min date to today----------------//

//-------------subtask----------------//

/**
 * Adds event listeners to the subtask input field to show and hide the subtask buttons container.
 */
function addSubtaskEventListener() {
  const inputField = document.getElementById("addTaskSubtask");
  const container = document.getElementById("subtask-buttons");

  inputField.addEventListener("focus", () => {
    container.style.display = "flex";
  });

  inputField.addEventListener("blur", () => {
    setTimeout(() => {
      container.style.display = "none";
    }, 100);
  });
}

/**
 * Creates a new subtask and adds it to the subtask container.
 */
function createNewSubtask() {
  let inputField = document.getElementById("addTaskSubtask");
  let subtaskContainer = document.getElementById("subtaskContainer");

  if (inputField.value) {
    subtaskContainer.innerHTML += subtaskHTML(inputField.value, subtaskID);
    subtaskID++;
    inputField.value = "";
  }
}

/**
 * Renders subtasks for a specific task when editing it.
 * @param {number} taskID - The index of the task in the remoteTasksAsJSON array.
 */
function renderSubtask(taskID) {
  let subtaskContainer = document.getElementById("editSubtaskContainer");
  for (let i = 0; i < remoteTasksAsJSON[taskID]["subtasks"].length; i++) {
    const subtaskName = remoteTasksAsJSON[taskID]["subtasks"][i]["name"];
    const subtaskStatus = remoteTasksAsJSON[taskID]["subtasks"][i]["status"];
    subtaskContainer.innerHTML += subtaskHTML(subtaskName, taskID, subtaskStatus);
  }
}

/**
 * Collects the subtask data from the UI and prepares it for storing in the remote tasks.
 * @returns {Array<Object>} An array of subtask objects.
 */
function pushSubtasks() {
  let subtasks = document.querySelectorAll(".subtask");
  let subtaskArray = [];
  subtasks.forEach((subtask) => {
    let checkbox = subtask.querySelector("input[type='checkbox']");
    subtaskArray.push({
      name: subtask.textContent,
      status: isChecked(checkbox),
    });
  });
  return subtaskArray;
}

/**
 * Checks whether a subtask is checked or not (done or in progress).
 * @param {HTMLInputElement} checkbox - The checkbox input element for the subtask.
 * @returns {string} The status of the subtask ("done" or "inProgress").
 */
function isChecked(checkbox) {
  if (checkbox.checked) {
    return "done";
  } else {
    return "inProgress";
  }
}

/**
 * Checks if a subtask is marked as done (checked).
 * @param {string} subtaskStatus - The status of the subtask ("done" or "inProgress").
 * @returns {boolean} True if the subtask is marked as done, false otherwise.
 */
function isSubtaskChecked(subtaskStatus) {
  if (subtaskStatus === "done") {
    return true;
  }
  return false;
}

/**
 * Clears the value of the subtask input field after adding a new subtask.
 */
function emptySubtaskValue() {
  let inputField = document.getElementById("addTaskSubtask");
  inputField.value = "";
}
