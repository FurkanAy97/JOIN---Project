/**
 * Includes external HTML content into designated elements with the 'w3-include-html' attribute.
 * @param {string} menu - The selected menu identifier.
 * @returns {void}
 */
async function includeHTML(menu) {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    file = element.getAttribute("w3-include-html");
    let resp = await fetch(file);
    if (resp.ok) {
      element.innerHTML = await resp.text();
    } else {
      element.innerHTML = "Page not found";
    }
  }
  selectedMenu(menu);
}
