let openTaskIndex;
let openTaskID;
let assignedToArray;
let remoteTasksAsJSON;
let assignedContactNames = [];

/**
 * Initializes the task board by fetching remote data, rendering task cards, and toggling button visibility.
 * @returns {Promise<void>}
 */
async function initBoard() {
  remoteTasksAsJSON = await getRemoteData("tasksRemote");
  remoteCategoryAsJSON = await getRemoteData("categoryRemote");
  renderTaskCards("todo", "todo");
  renderTaskCards("inProgress", "inProgress");
  renderTaskCards("awaitingFeedback", "awaitingFeedback");
  renderTaskCards("done", "done");
  toggleButtonVisibility();
  isEmptyStatusContainer();
}

/**
 * Renders the category label color based on the category name.
 * @param {number} i - The index of the task in the remoteTasksAsJSON array.
 * @returns {string} The color value for the category label.
 */
function renderCategoryLabelColor(i) {
  let categoryName =
    remoteTasksAsJSON[i]["category"].charAt(0).toUpperCase() + remoteTasksAsJSON[i]["category"].slice(1);
  let labelColor = findColorByName(categoryName);

  return labelColor;
}

/**
 * Finds and returns the color associated with a category name.
 * @param {string} categoryName - The name of the category.
 * @returns {string|null} The color associated with the category, or null if not found.
 */
function findColorByName(categoryName) {
  for (let i = 0; i < remoteCategoryAsJSON.length; i++) {
    if (remoteCategoryAsJSON[i].name === categoryName) {
      return remoteCategoryAsJSON[i].color;
    }
  }
  return null;
}

/**
 * Renders task cards based on their status and container.
 * @param {string} container - The container element's ID.
 * @param {string} status - The status of the tasks to be rendered.
 */
function renderTaskCards(container, status) {
  let cardIndex = 0;
  document.getElementById(container).innerHTML = "";
  for (let i = 0; i < remoteTasksAsJSON.length; i++) {
    const taskContainer = document.getElementById(container);
    const task = remoteTasksAsJSON[i];
    if (task["status"] === status) {
      let cardID = remoteTasksAsJSON[i]["status"] + cardIndex;

      taskContainer.innerHTML += taskCardHTML(i, cardID);
      renderAssignedTo(i, `assignedToContainerSmall${i}`);
      cardIndex++;
    }
  }
}

/**
 * Renders the description of a task.
 * @param {number} i - The index of the task in the remoteTasksAsJSON array.
 * @returns {string} The task description.
 */
function renderTaskDescription(i) {
  let description = remoteTasksAsJSON[i]["description"];
  return description;
}

/**
 * Adjusts the minimum height of status containers if they are empty.
 */
function isEmptyStatusContainer() {
  let statusContainers = document.querySelectorAll(".statusContainer");
  statusContainers.forEach((c) => {
    if (c.innerHTML == "") {
      c.style.minHeight = "100px";
    }
  });
}

/**
 * Opens a task card with additional details.
 * @param {number} i - The index of the task in the remoteTasksAsJSON array.
 * @param {string} cardID - The ID of the card to open.
 */
function openTaskCard(i, cardID) {
  const taskLayer = document.getElementById("taskLayer");
  taskLayer.style.zIndex = "1";
  if (window.innerWidth > 670) {
    taskLayer.style.zIndex = "103";
  } else {
    taskLayer.style.zIndex = "1";
  }
  taskLayer.innerHTML = openTaskCardHTML(i, cardID);
  openTaskID = cardID;
  displayLayer();
  renderAssignedTo(i, "assignedTo-container");
  renderClosingArrow();
  document.body.style.overflow = "hidden";
  fillAssignedContactNames();
}

/**
 * Fills the assignedContactNames array with contact names from assignedToContainer.
 */
function fillAssignedContactNames() {
  let assignedToContainer = document.querySelectorAll(".assignedTo-row p");
  assignedToContainer.forEach((container) => {
    let name = container;
    assignedContactNames.push(name.innerHTML);
  });
}

/**
 * Edits the content of a task card.
 * @param {number} taskIndex - The index of the task in the remoteTasksAsJSON array.
 */
function editTaskCard(taskIndex) {
  let openCardContainer = document.querySelector(".task-card-big");
  openCardContainer.innerHTML = editTaskCardHTML(taskIndex);
  fillEditFields(taskIndex);
  addContactNamesToAssignedTo();
  renderSubtask(taskIndex);
  openTaskIndex = taskIndex;
  excludeNamesInDropdown();
}

/**
 * Excludes names in the dropdown that are already assigned.
 */
function excludeNamesInDropdown() {
  for (let i = 0; i < assignedContactNames.length; i++) {
    const name = assignedContactNames[i];
    let dropdownNames = document.querySelectorAll(".option");
    dropdownNames.forEach((dropdownName) => {
      let contactName = dropdownName.innerHTML;
      if (contactName.includes(name)) {
        dropdownName.classList.add("d-none");
      }
    });
  }
}

/**
 * Fills the input fields with task details for editing.
 * @param {number} taskIndex - The index of the task in the remoteTasksAsJSON array.
 */
function fillEditFields(taskIndex) {
  let titleInputField = document.getElementById("addTaskTitle");
  let descriptionInputField = document.getElementById("addTaskDescription");
  let dueDateField = document.getElementById("date");
  let prio = remoteTasksAsJSON[taskIndex]["priority"];
  assignedToArray = remoteTasksAsJSON[taskIndex]["assignedTo"];

  titleInputField.value = remoteTasksAsJSON[taskIndex]["title"];
  descriptionInputField.value = remoteTasksAsJSON[taskIndex]["description"];
  dueDateField.value = remoteTasksAsJSON[taskIndex]["dueDate"];

  setPrio(prio);
  pushToAssignedContact(assignedToArray);
  renderAssignedToEdit();
}

/**
 * Saves changes made to a task card.
 * @returns {Promise<void>}
 */
async function saveChanges() {
  const titleInputFieldValue = document.getElementById("addTaskTitle").value;
  const descriptionInputFieldValue = document.getElementById("addTaskDescription").value;
  const dueDateFieldValue = document.getElementById("date").value;
  const updatedTask = {
    ...remoteTasksAsJSON[openTaskIndex],
    title: titleInputFieldValue,
    description: descriptionInputFieldValue,
    dueDate: dueDateFieldValue,
    priority: priority,
    assignedTo: assignedContacts,
  };
  remoteTasksAsJSON[openTaskIndex] = updatedTask;
  loadSubtasks();
  await setItem("tasksRemote", remoteTasksAsJSON);
  openTaskCard(openTaskIndex, openTaskID);
  assignedContacts = [];
  await initBoard();
}

/**
 * Loads subtask status changes from the editSubtaskContainer.
 */
function loadSubtasks() {
  let subtaskContainer = document.getElementById("editSubtaskContainer");

  for (let i = 0; i < subtaskContainer.childElementCount; i++) {
    let subtask = subtaskContainer.children[i];
    let checkbox = subtask.querySelector(".checkbox");
    let storageSubtask = remoteTasksAsJSON[openTaskIndex]["subtasks"][i];
    if (checkbox.checked) {
      storageSubtask.status = "done";
    } else {
      storageSubtask.status = "inProgress";
    }
  }
}

/**
 * Pushes assigned contacts to the assignedContacts array.
 * @param {Array} assignedToArray - Array of assigned contacts.
 */
function pushToAssignedContact(assignedToArray) {
  for (let i = 0; i < assignedToArray.length; i++) {
    const contact = assignedToArray[i];
    assignedContacts.push(contact);
  }
}

/**
 * Renders the assigned contacts in the edit mode.
 */
function renderAssignedToEdit() {
  const chosenContacts = document.getElementById("chosenContacts");
  assignedContacts.forEach((contact) => {
    const { color, name, email, phone } = contact;
    const initials = getInitials(name);
    const contactIndex = contacts.findIndex(
      (c) => c.name === name && c.color === color && c.email === email && c.phone === phone
    );
    if (chosenContacts.children.length < 5) {
      chosenContacts.innerHTML += `<div onclick="removeContact(${contactIndex})" style="background-color:${color}" class="chosenContactInitials">${initials}</div>`;
    }
  });
}

/**
 * Renders the closing arrow icon based on the window width.
 */
function renderClosingArrow() {
  let arrow = document.querySelector(".task-card-arrow");
  if (window.innerWidth > 670) {
    arrow.style.display = "none";
  } else {
    arrow.style.display = "unset";
  }
}

/**
 * Renders the close button based on the window width.
 */
function renderCloseBtn() {
  const closeBtn = document.querySelector(".task-card-closeBtn");
  if (window.innerWidth > 670) {
    closeBtn.style.display = "unset";
  } else {
    closeBtn.style.display = "none";
  }
}

/**
 * Deletes a task card and updates the board.
 * @param {number} cardIndex - The index of the task card in the remoteTasksAsJSON array.
 * @param {string} cardID - The ID of the task card.
 * @returns {Promise<void>}
 */
async function deleteCard(cardIndex, cardID) {
  const card = document.getElementById(cardID);
  card.remove();
  remoteTasksAsJSON.splice(cardIndex, 1);
  clearContainers(["todo", "inProgress", "awaitingFeedback", "done"]);
  setItem("tasksRemote", remoteTasksAsJSON);
  remoteTasksAsJSON = await getRemoteData("tasksRemote");
  initBoard();
  closeLayer();
  document.body.style.overflow = "auto";
}

/**
 * Retrieves remote data from storage based on a key.
 * @param {string} key - The key to retrieve remote data.
 * @returns {Promise<object>} The retrieved remote data as an object.
 */
async function getRemoteData(key) {
  let res = await getItem(key);
  return JSON.parse(res.data.value.replace(/'/g, '"'));
}

/**
 * Clears the innerHTML of specified container elements.
 * @param {Array} containerIds - Array of container IDs to clear.
 */
function clearContainers(containerIds) {
  containerIds.forEach((containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
  });
}

/**
 * Renders the urgency image based on task priority.
 * @param {number} i - The index of the task in the remoteTasksAsJSON array.
 * @returns {string} The path to the urgency image.
 */
function renderUrgencyImg(i) {
  const urgency = remoteTasksAsJSON[i]["priority"];
  if (urgency == "urgent") {
    return "assets/icons/urgent.png";
  } else if (urgency == "medium") {
    return "assets/icons/medium.png";
  } else {
    return "assets/icons/low.png";
  }
}

/**
 * Renders the urgency label image based on task priority.
 * @param {number} i - The index of the task in the remoteTasksAsJSON array.
 * @returns {string} The path to the urgency label image.
 */
function renderUrgencyLabel(i) {
  const urgency = remoteTasksAsJSON[i]["priority"];
  if (urgency == "urgent") {
    return "assets/icons/urgent-label.png";
  } else if (urgency == "medium") {
    return "assets/icons/medium-label.png";
  } else {
    return "assets/icons/low-label.png";
  }
}

/**
 * Renders assigned contacts for a task card.
 * @param {number} taskID - The index of the task in the remoteTasksAsJSON array.
 * @param {string} containerClass - The class of the container to render assigned contacts.
 */
function renderAssignedTo(taskID, containerClass) {
  const container = document.getElementById(containerClass);
  const assignedToArray = remoteTasksAsJSON[taskID]["assignedTo"];
  for (let i = 0; i < assignedToArray.length; i++) {
    const assignedTo = assignedToArray[i];
    const assignedToName = assignedTo["name"];
    const contactColor = assignedTo["color"];
    const initials = getInitials(assignedToName);
    if (container.id === "assignedTo-container") {
      container.innerHTML += assignedToHTML(contactColor, initials, assignedToName);
    } else {
      container.innerHTML += assignedToCardHTML(contactColor, initials, assignedToName);
    }
  }
}

/**
 * Displays the task details layer on the screen.
 */
function displayLayer() {
  let layer = document.getElementById("taskLayer");
  layer.style.display = "flex";
  layer.addEventListener("click", (event) => {
    if (event.target === layer) {
      closeSlideInContainer();
      closeLayer();
      closeTaskCardBig();
      assignedContacts = [];
      document.body.style.overflow = "auto";
    }
  });
}

/**
 * Closes the slide-in container and the task details layer.
 */
function closeSlideInBtn() {
  closeSlideInContainer();
  closeLayer();
  closeTaskCardBig();
  document.body.style.overflow = "auto";
}

/**
 * Closes the slide-in container.
 */
function closeSlideInContainer() {
  const slideInContainer = document.getElementById("slideInContainer");
  const taskLayer = document.getElementById("taskLayer");
  taskLayer.style.zIndex = "103";
  if (slideInContainer) {
    slideInContainer.style.transform = "translateX(200%)";
  }
}

/**
 * Closes the expanded task card view.
 */
function closeTaskCardBig() {
  const taskCardBig = document.querySelector(".task-card-big");
  if (taskCardBig) {
    taskCardBig.style.display = "none";
  }
}

/**
 * Closes the task details layer.
 */
function closeLayer() {
  let layer = document.getElementById("taskLayer");
  setTimeout(() => {
    layer.style.display = "none";
  }, 200),
    layer.removeEventListener("click", displayLayer);
  subtaskCount = 0;
  assignedContactNames = [];
}

/**
 * Displays the slide-in container for a specified status.
 * @param {string} status - The status of the task.
 */
function slideInContainer(status) {
  displayLayer();
  const taskLayer = document.getElementById("taskLayer");
  taskLayer.style.zIndex = "1000";
  taskLayer.innerHTML = slideInHTML(status);
  setTimeout(() => {
    const slideInContainer = document.getElementById("slideInContainer");
    slideInContainer.style.display = "flex";
    slideInContainer.style.transform = "translateX(0%)";
  }, 100);
  addContactNamesToAssignedTo();
  addCategories();
  addSubtaskEventListener();
  document.body.style.overflow = "hidden";
}

document.addEventListener("input", function (event) {
  if (event.target.id === "searchInput") {
    filterCards();
  }
});

/**
 * Filters task cards based on search input.
 */
function filterCards() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".task-card");
  cards.forEach((card) => {
    const header = card.querySelector(".task-title").innerHTML.toLowerCase();
    const description = card.querySelector(".task-description").innerHTML.toLowerCase();
    if (header.includes(query) || description.includes(query)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

/**
 * Counts the number of completed subtasks for a task.
 * @param {number} i - The index of the task in the remoteTasksAsJSON array.
 * @returns {number} The count of completed subtasks.
 */
function countDoneSubtasks(i) {
  let doneSubtasks = remoteTasksAsJSON[i]["subtasks"].filter((subtask) => subtask.status === "done");
  let doneSubtasksCount = doneSubtasks.length;
  return doneSubtasksCount;
}

/**
 * Renders the progress percentage for a task's subtasks.
 * @param {number} i - The index of the task in the remoteTasksAsJSON array.
 * @returns {number} The progress percentage.
 */
function renderProgress(i) {
  let doneCount = countDoneSubtasks(i);
  let subtaskLength = remoteTasksAsJSON[i]["subtasks"].length;
  let percentage = (doneCount / subtaskLength) * 100;
  if (subtaskLength == 0) {
    return 0;
  } else {
    return percentage;
  }
}

// -----------------------drag-&-drop ----------------------------//

let currentDraggedElement;

/**
 * Initiates dragging for reordering tasks.
 * @param {number} i - The index of the task in the remoteTasksAsJSON array.
 */
function startDragging(i) {
  currentDraggedElement = i;
}

/**
 * Moves a task to a new status.
 * @param {string} status - The new status to move the task to.
 */
async function moveTo(status) {
  remoteTasksAsJSON[currentDraggedElement]["status"] = status;
  await setItem("tasksRemote", remoteTasksAsJSON);
  remoteTasksAsJSON = await getRemoteData("tasksRemote");
  initBoard();
  removeHighlight(status);
}

/**
 * Allows dropping an element during drag-and-drop.
 * @param {Event} ev - The drag event.
 */
function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * Highlights the target container during drag-and-drop.
 * @param {string} id - The ID of the container to highlight.
 */
function highlight(id) {
  let container = document.getElementById(id);
  container.style.transition = "background-color 0.5s";
  container.style.backgroundColor = "#d1d1d1";
}

/**
 * Removes the highlight from a container after drag-and-drop.
 * @param {string} id - The ID of the container to remove highlight from.
 */
function removeHighlight(id) {
  let container = document.getElementById(id);
  container.style.transition = "background-color 0.5s";
  container.style.backgroundColor = "#f6f7f8";
}

/**
 * Highlights all status containers during drag-and-drop.
 */
function highlightAll() {
  let statusContainers = document.querySelectorAll(".statusContainer");
  statusContainers.forEach((container) => {
    container.style.border = "1px dashed black";
    container.style.transition = "border 0.5s";
  });
}

/**
 * Removes the highlight from all status containers after drag-and-drop.
 */
function removeHighlightAll() {
  let statusContainers = document.querySelectorAll(".statusContainer");
  if (statusContainers) {
    statusContainers.forEach((container) => {
      container.style.border = "none";
      container.style.transition = "none";
    });
  }
}

/**
 * Toggles the dropdown menu for options.
 * @param {Event} event - The click event.
 * @param {number} i - The index of the task in the remoteTasksAsJSON array.
 */
function toggleDropdown(event, i) {
  event.stopPropagation();
  const dropdownContent = document.getElementById(`dropdown-content${i}`);
  dropdownContent.style.transition = "opacity 0.3s ease";
  if (dropdownContent.style.display === "" || dropdownContent.style.display === "none") {
    dropdownContent.style.opacity = "0";
    dropdownContent.style.display = "block";
    setTimeout(() => {
      dropdownContent.style.opacity = "1";
    }, 10);
    document.addEventListener("click", hideDropdown);
  } else {
    hideDropdown();
  }
}
/**
 * hides the Dropdown
 */
function hideDropdown() {
  dropdownContent.style.opacity = "0";
  dropdownContent.style.display = "none";
  document.removeEventListener("click", hideDropdown);
}

/**
 * Selects an option from the dropdown menu.
 * @param {Event} event - The click event.
 * @param {number} option - The selected option index.
 * @param {number} i - The index of the task in the remoteTasksAsJSON array.
 * @param {string} status - The new status for the task.
 */
async function selectOption(event, option, i, status) {
  event.stopPropagation();
  let dropdownBtn = document.getElementById(`dropdown-btn${option}`);
  let taskContainer = remoteTasksAsJSON[i];
  dropdownBtn.classList.remove("highlighted");

  if (option >= 1 && option <= 4) {
    dropdownBtn.classList.add("highlighted");
    taskContainer["status"] = status;
    await setItem("tasksRemote", remoteTasksAsJSON);
    await initBoard();
  }
}

/**
 * Toggles the visibility of dropdown buttons based on the window width.
 */
function toggleButtonVisibility() {
  const button = document.getElementById("dropdown-btn${i}");
  let buttons = document.querySelectorAll(".dropdown-btn");
  buttons.forEach((button) => {
    if (window.innerWidth < 671) {
      button.style.display = "block";
    } else {
      button.style.display = "none";
    }
  });
}

/**
 * Handles window resize event to toggle dropdown button visibility.
 */
window.addEventListener("resize", toggleButtonVisibility);
