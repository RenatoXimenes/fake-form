function fillForm() {
  const names = ["Abelardo Vaca", "Adalberto Galhofa", "Agostinho Trelelê"];

  function getRandomDate() {
    const start = new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + Math.floor(Math.random() * 10) + 1); // Garantir que a segunda data seja maior que a primeira
    return [start.toISOString().split("T")[0], end.toISOString().split("T")[0]];
  }

  function getFirstName(name) {
    return name.split(" ")[0].toLowerCase();
  }

  function getRandomName() {
    return names[Math.floor(Math.random() * names.length)];
  }

  function getRandomNumber() {
    return Math.floor(Math.random() * 10000);
  }

  function getCPF() {
    return "864.919.120-78";
  }

  function getEmail(name) {
    const emailName = getFirstName(name);
    return `${emailName}@gmail.com`;
  }

  function getPhoneNumber() {
    return "(61)999999999";
  }

  function getCEP() {
    return "700000000";
  }

  function getRG() {
    return "24999";
  }

  function getMatricula() {
    return "3999999";
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

  function isVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function fillInputs() {
    const form = document.querySelector("form");
    if (!form) return;

    const inputs = Array.from(
      form.querySelectorAll("input, select, textarea, div[role='combobox']")
    );
    const [firstDate, secondDate] = getRandomDate();
    console.log(firstDate);
    console.log(secondDate);
    let userName = getRandomName();

    inputs.reduce((promise, input) => {
      return promise.then(() => {
        return new Promise((resolve) => {
          if (!isVisible(input)) {
            return resolve();
          }

          const label = document.querySelector(`label[for='${input.id}']`);
          const labelText = label ? label.textContent.toLowerCase() : "";

          if (labelText.includes("nome")) {
            userName = input.value || userName;
          }

          if (
            input.type === "text" ||
            input.type === "email" ||
            input.type === "tel" ||
            input.type === "number"
          ) {
            if (labelText.includes("cpf")) {
              input.value = getCPF();
            } else if (
              labelText.includes("email") ||
              labelText.includes("e-mail")
            ) {
              input.value = getEmail(userName);
            } else if (
              labelText.includes("telefone") ||
              labelText.includes("celular") ||
              labelText.includes("fone")
            ) {
              input.value = getPhoneNumber();
            } else if (labelText.includes("cep")) {
              input.value = getCEP();
            } else if (
              labelText.includes("rg") ||
              labelText.includes("registro geral")
            ) {
              input.value = getRG();
            } else if (
              labelText.includes("matrícula") ||
              labelText.includes("matricula") ||
              labelText.includes("matr.")
            ) {
              input.value = getMatricula();
            } else if (
              input.name.toLowerCase().includes("número") ||
              input.name.toLowerCase().includes("num") ||
              input.name.toLowerCase().includes("nº") ||
              labelText.includes("número") ||
              labelText.includes("num") ||
              labelText.includes("nº")
            ) {
              input.value = getRandomNumber();
            } else if (input.placeholder.toLowerCase().includes("dd/mm/yyyy")) {
              input.value = new Date().toLocaleDateString("pt-BR"); // Ajuste para formato dd/mm/yyyy
            } else {
              input.value = getRandomName();
            }
            triggerEvent(input, "input");
            triggerEvent(input, "change");
            resolve();
          } else if (input.type === "radio" || input.type === "checkbox") {
            input.checked = Math.random() >= 0.5;
            triggerEvent(input, "change");
            resolve();
          } else if (input.type === "date") {
            input.value = firstDate;
            triggerEvent(input, "input");
            triggerEvent(input, "change");
            const nextInput =
              inputs[Array.prototype.indexOf.call(inputs, input) + 1];
            if (nextInput && nextInput.type === "date") {
              nextInput.value = secondDate;
              triggerEvent(nextInput, "input");
              triggerEvent(nextInput, "change");
            }
            resolve();
          } else if (input.tagName === "SELECT") {
            const options = Array.from(input.options);
            if (options.length > 0) {
              const randomOption =
                options[Math.floor(Math.random() * options.length)];
              input.value = randomOption.value;
              triggerEvent(input, "change");
            }
            resolve();
          } else if (input.tagName === "TEXTAREA") {
            input.value = getRandomName();
            triggerEvent(input, "input");
            triggerEvent(input, "change");
            resolve();
          } else if (input.getAttribute("role") === "combobox") {
            simulateMouseEvent(input, "mousedown");
            simulateMouseEvent(input, "mouseup");
            input.click();
            setTimeout(() => {
              const options = document.querySelectorAll("[role='option']");
              const visibleOptions = Array.from(options).filter(isVisible);
              if (visibleOptions.length > 0) {
                const randomOption =
                  visibleOptions[
                    Math.floor(Math.random() * visibleOptions.length)
                  ];
                simulateMouseEvent(randomOption, "mousedown");
                simulateMouseEvent(randomOption, "mouseup");
                randomOption.click();
                triggerEvent(input, "input");
                triggerEvent(input, "change");
              }
              // Fechar o dropdown
              input.click();
              resolve();
            }, 500); // Ajuste o tempo conforme necessário
          } else {
            resolve();
          }
        });
      });
    }, Promise.resolve());
  }

  // Fill inputs twice to handle dependencies
  fillInputs();
  setTimeout(fillInputs, 1000); // Adjust the timeout as necessary
}

window.fillForm = fillForm;
