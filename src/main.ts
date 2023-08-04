/**
 *
 * @param _   //not used
 * @param _2  //not used
 * @param descriptor
 */

function AutoBind(_: any, _2: any, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor = {
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

interface Validateable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

//check if all input requirements are met
function validate(validateableInput: Validateable) {
  let isValid = true;
  const { value, required, minLength, maxLength, min, max } = validateableInput;
  if (required) {
    isValid = isValid && value.toString().trim().length !== 0;
  }
  if (
    minLength != null &&
    typeof value === "string" &&
    typeof minLength !== "undefined"
  ) {
    isValid = isValid && value.trim().length >= minLength;
  }
  if (
    maxLength != null &&
    typeof value === "string" &&
    typeof maxLength !== "undefined"
  ) {
    isValid = isValid && value.trim().length <= maxLength;
  }
  if (min != null && typeof value === "number") {
    isValid = isValid && value >= min;
  }
  if (max != null && typeof value === "number") {
    isValid = isValid && value <= max;
  }
  return isValid;
}

enum ProjectStatus {
  ACTIVE,
  FINISHED,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener = (items: Project[]) => void;

//Global State Class with Singleton Pattern
class ProjectState {
  private listeners: any[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {}
  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }
  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject: Project = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.ACTIVE
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

//Class Form Input
class ProjectInput {
  templateElement: HTMLTemplateElement;
  parentElement: HTMLDivElement;
  element: HTMLFormElement;

  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    //Constructor Start
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.parentElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;

    this.attach();

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
  private attach() {
    this.parentElement.insertAdjacentElement("afterbegin", this.element);
  }

  //gets User Input
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
      //cuts away all empty spaces before and after input und checks, if anything is inside
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
      console.log(title, description, people);
      this.clearInputs();
    }
  }
  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
}

//class Project List (active and finished)

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;

  assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;
    projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });
    this.attach();
    this.renderContent();
  }
  renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    this.assignedProjects.forEach((projectItem) => {
      const listItem = document.createElement("li");
      listItem.textContent = projectItem.title;
      listEl.appendChild(listItem);
    });
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

const projectState = ProjectState.getInstance();
projectState.addProject("Hello", "First Project", 3);
console.log(projectState);

new ProjectInput();
new ProjectList("finished");
new ProjectList("active");
