//Class Form Input
import { Component } from "./base-component.js";
import { validate, Validateable } from "../utilities/validation.js";
import { AutoBind } from "../decorators/autobind.js";
import { projectState } from "../state/project-state.js";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {

    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;
  
    constructor() {
      super("project-input", "app", true, "user-input")
      //Constructor Start
  
      this.titleInputElement = document.querySelector(
        "#title"
      ) as HTMLInputElement;
      this.descriptionInputElement = document.querySelector(
        "#description"
      ) as HTMLInputElement;
      this.peopleInputElement = document.querySelector(
        "#people"
      ) as HTMLInputElement;
  
      this.configure();
      //Constructor Ende
    }
  
    //gets User Inputconsole.log(projectState);
  
    private saveUserInput(): [string, string, number] | void {
      const enteredTitle = this.titleInputElement.value;
      const enteredDescription = this.descriptionInputElement.value;
      const enteredPeople = this.peopleInputElement.value;
  
      const titleValidateable: Validateable = {
        value: enteredTitle,
        required: true,
      };
      const descriptionValidateable: Validateable = {
        value: enteredDescription,
        required: true,
        minLength: 5,
      };
      const peopleValidateable: Validateable = {
        value: +enteredPeople,
        required: true,
        min: 1,
        max: 10,
      };
  
      if (
        !validate(titleValidateable) ||
        !validate(descriptionValidateable) ||
        !validate(peopleValidateable)
      ) {
        alert("Invalid Input, please try again!");
        return;
      }
      return [enteredTitle, enteredDescription, +enteredPeople]; // the + changes the variable to a number
    }
  
    private clearInputs() {
      this.titleInputElement.value = "";
      this.descriptionInputElement.value = "";
      this.peopleInputElement.value = "";
    }
  
    @AutoBind
    private submitHandler(event: Event) {
      event.preventDefault();
      const userInput = this.saveUserInput();
      if (Array.isArray(userInput)) {
        const [title, description, people] = userInput;
        projectState.addProject(title, description, people)
        this.clearInputs();
      }
    }
    protected configure() {
      this.element.addEventListener("submit", this.submitHandler);
    }
    renderContent(): void {
      
    }
  }