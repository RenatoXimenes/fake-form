document.addEventListener("DOMContentLoaded", () => {
  const restrictToFormCheckbox = document.getElementById("restrictToForm");
  const customLabelInput = document.getElementById("customLabel");
  const customValueInput = document.getElementById("customValue");
  const addCustomFieldButton = document.getElementById("addCustomField");
  const viewCustomFieldsButton = document.getElementById("viewCustomFields");
  const customFieldsModal = document.getElementById("customFieldsModal");
  const customFieldsList = document.getElementById("customFieldsList");
  const closeModal = document.getElementsByClassName("close")[0];

  // Load the checkbox state and custom fields from storage
  chrome.storage.sync.get(["restrictToForm", "customFields"], (result) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      restrictToFormCheckbox.checked = result.restrictToForm || false;
      window.customFields = result.customFields || [];
    }
  });

  restrictToFormCheckbox.addEventListener("change", () => {
    // Save the checkbox state to storage
    chrome.storage.sync.set(
      { restrictToForm: restrictToFormCheckbox.checked },
      () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        }
      }
    );
  });

  addCustomFieldButton.addEventListener("click", () => {
    const customLabel = customLabelInput.value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/gi, "");
    const customValues = customValueInput.value
      .split(";")
      .map((v) => v.trim())
      .filter((v) => v);

    if (customLabel && customValues.length) {
      const newCustomField = { label: customLabel, values: customValues };
      window.customFields.push(newCustomField);
      chrome.storage.sync.set({ customFields: window.customFields }, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          customLabelInput.value = "";
          customValueInput.value = "";
          alert("Novo preenchimento padrão adicionado!");
        }
      });
    } else {
      alert("Por favor, preencha ambos os campos.");
    }
  });

  viewCustomFieldsButton.addEventListener("click", () => {
    customFieldsList.innerHTML = "";
    window.customFields.forEach((field, index) => {
      const fieldItem = document.createElement("div");
      fieldItem.textContent = `${field.label}: [${field.values.join(", ")}]`;

      const editButton = document.createElement("span");
      editButton.textContent = "Editar";
      editButton.className = "edit-button";
      editButton.addEventListener("click", () => {
        const newLabel = prompt("Edite a label:", field.label);
        const newValues = prompt(
          "Edite os valores separados por ';':",
          field.values.join(";")
        );
        if (newLabel && newValues) {
          window.customFields[index].label = newLabel
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/gi, "");
          window.customFields[index].values = newValues
            .split(";")
            .map((v) => v.trim())
            .filter((v) => v);
          chrome.storage.sync.set({ customFields: window.customFields }, () => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            } else {
              viewCustomFieldsButton.click();
            }
          });
        }
      });

      const deleteButton = document.createElement("span");
      deleteButton.textContent = "Excluir";
      deleteButton.className = "delete-button";
      deleteButton.addEventListener("click", () => {
        window.customFields.splice(index, 1);
        chrome.storage.sync.set({ customFields: window.customFields }, () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          } else {
            fieldItem.remove();
          }
        });
      });

      fieldItem.appendChild(editButton);
      fieldItem.appendChild(deleteButton);
      customFieldsList.appendChild(fieldItem);
    });
    customFieldsModal.style.display = "block";
  });

  closeModal.addEventListener("click", () => {
    customFieldsModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === customFieldsModal) {
      customFieldsModal.style.display = "none";
    }
  });

  document.getElementById("fillForm").addEventListener("click", () => {
    const restrictToForm = restrictToFormCheckbox.checked;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: fillForm,
        args: [restrictToForm, window.customFields],
      });
    });
  });
});

function fillForm(restrictToForm, customFields) {
  const predefinedFields = {
    nome: [
      "Abelardo Queiroz",
      "Anacleto Lins",
      "Armando Pinto",
      "Batista Pé-de-Feijão",
      "Celsa Guerra",
      "Cornelio Sapato",
      "Dorival de Jesus",
      "Eurico Pimenta",
      "Eustáquio Caldo",
      "Filisberto Maionese",
      "Germano Fuzil",
      "Gildasio Sabiá",
      "Hermengarda Laranja",
      "Ildefonso Treta",
      "Jacinto Leite Aquino Rego",
      "Juvenal Cabeça",
      "Margarida Mexerica",
      "Nicanor Quebra-Ossos",
      "Odorico Fumaça",
      "Ubiratan Pinga",
    ],
    cpf: ["864.919.120-78"],
    email: ["email1@gmail.com", "email2@gmail.com"],
    telefone: ["(61)999999999", "(61)888888888"],
    cep: ["700000000"],
    rg: ["24999"],
    matricula: ["3999999", "3053838"],
    "período atual": ["1", "2", "3", "4", "5"],
  };

  function getRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function normalizeString(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/gi, "");
  }

  function triggerEvent(element, eventType) {
    const event = new Event(eventType, { bubbles: true });
    element.dispatchEvent(event);
  }

  function simulateMouseEvent(element, eventType) {
    const event = new MouseEvent(eventType, {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
  }

  function fillInputs(singleRun = false) {
    const context = restrictToForm ? document.querySelector("form") : document;
    if (!context) return;

    const inputs = Array.from(
      context.querySelectorAll("input, select, textarea, div[role='combobox']")
    );
    const randomDates = [
      new Date(Date.now() + Math.floor(Math.random() * 86400000 * 30)),
      new Date(Date.now() + 86400000 * (30 + Math.floor(Math.random() * 30))),
    ];

    // Organize inputs to prioritize "estado" before "cidade"
    const estadoInputs = [];
    const cidadeInputs = [];
    const otherInputs = [];

    inputs.forEach((input) => {
      const label = document.querySelector(`label[for='${input.id}']`);
      const labelText = label ? normalizeString(label.textContent) : "";

      if (labelText.includes("estado")) {
        estadoInputs.push(input);
      } else if (labelText.includes("cidade")) {
        cidadeInputs.push(input);
      } else {
        otherInputs.push(input);
      }
    });

    const allInputs = [...estadoInputs, ...cidadeInputs, ...otherInputs];

    function fillInput(input) {
      return new Promise((resolve) => {
        const label = document.querySelector(`label[for='${input.id}']`);
        const labelText = label ? normalizeString(label.textContent) : "";

        // Check custom fields
        const customField = customFields.find((field) =>
          labelText.includes(normalizeString(field.label))
        );

        if (customField) {
          const randomValue = getRandomItem(customField.values);
          if (input.tagName === "SELECT") {
            const options = Array.from(input.options);
            const optionToSelect = options.find(
              (option) =>
                normalizeString(option.textContent.trim()) ===
                normalizeString(randomValue)
            );
            if (optionToSelect) {
              input.value = optionToSelect.value;
              triggerEvent(input, "change");
            }
          } else if (input.getAttribute("role") === "combobox") {
            simulateMouseEvent(input, "mousedown");
            simulateMouseEvent(input, "mouseup");
            input.click();
            setTimeout(() => {
              const options = document.querySelectorAll("[role='option']");
              const optionToSelect = Array.from(options).find(
                (option) =>
                  normalizeString(option.textContent.trim()) ===
                  normalizeString(randomValue)
              );
              if (optionToSelect) {
                simulateMouseEvent(optionToSelect, "mousedown");
                simulateMouseEvent(optionToSelect, "mouseup");
                optionToSelect.click();
                triggerEvent(input, "input");
                triggerEvent(input, "change");
              }
              input.click(); // Fechar o dropdown
              resolve();
            }, 100); // Ajuste o tempo conforme necessário
          } else {
            input.value = randomValue;
            triggerEvent(input, "input");
            triggerEvent(input, "change");
          }
          return resolve();
        }

        // Check predefined fields
        for (const key in predefinedFields) {
          if (labelText.includes(normalizeString(key))) {
            const randomValue = getRandomItem(predefinedFields[key]);
            input.value = randomValue;
            triggerEvent(input, "input");
            triggerEvent(input, "change");
            return resolve();
          }
        }

        // Default filling for other fields
        if (input.type === "date") {
          const dateToSelect = randomDates.shift();
          input.value = dateToSelect.toISOString().split("T")[0];
          triggerEvent(input, "input");
          triggerEvent(input, "change");
          const nextInput =
            allInputs[Array.prototype.indexOf.call(allInputs, input) + 1];
          if (nextInput && nextInput.type === "date") {
            const nextDate = new Date(dateToSelect.getTime() + 86400000);
            nextInput.value = nextDate.toISOString().split("T")[0];
            triggerEvent(nextInput, "input");
            triggerEvent(nextInput, "change");
          }
          input.click();
          resolve();
        } else if (input.type === "radio" || input.type === "checkbox") {
          if (singleRun) {
            if (Math.random() >= 0.5) {
              simulateMouseEvent(input, "click");
            }
            triggerEvent(input, "change");
          }
          return resolve();
        } else if (input.tagName === "SELECT") {
          const options = Array.from(input.options);
          if (options.length > 0) {
            const randomOption = getRandomItem(options);
            input.value = randomOption.value;
            triggerEvent(input, "change");
          }
          return resolve();
        } else if (input.tagName === "TEXTAREA") {
          input.value = getRandomItem(predefinedFields["nome"]);
          triggerEvent(input, "input");
          triggerEvent(input, "change");
          return resolve();
        } else if (input.getAttribute("role") === "combobox") {
          simulateMouseEvent(input, "mousedown");
          simulateMouseEvent(input, "mouseup");
          input.click();
          setTimeout(() => {
            const options = document.querySelectorAll("[role='option']");
            const visibleOptions = Array.from(options);
            if (visibleOptions.length > 0) {
              const randomOption = getRandomItem(visibleOptions);
              simulateMouseEvent(randomOption, "mousedown");
              simulateMouseEvent(randomOption, "mouseup");
              randomOption.click();
              triggerEvent(input, "input");
              triggerEvent(input, "change");
            }
            // Fechar o dropdown
            input.click();
            resolve();
          }, 100); // Ajuste o tempo conforme necessário
        } else {
          return resolve();
        }
      });
    }

    function fillInputsSequentially(inputs) {
      return inputs.reduce((promise, input) => {
        return promise.then(() =>
          fillInput(input).then(
            () => new Promise((resolve) => setTimeout(resolve, 100))
          )
        );
      }, Promise.resolve());
    }

    // Fill estado inputs, wait for 1 second, then fill cidade inputs, then others
    fillInputsSequentially(estadoInputs)
      .then(() => new Promise((resolve) => setTimeout(resolve, 100)))
      .then(() => fillInputsSequentially(cidadeInputs))
      .then(() => fillInputsSequentially(otherInputs));
  }

  // Fill inputs twice to handle dependencies, but only click checkboxes once
  fillInputs(true);
  setTimeout(() => fillInputs(), 100); // Adjust the timeout as necessary
}

window.fillForm = fillForm;
