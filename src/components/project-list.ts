//class Project List (active and finished)
import { Component } from "./base-component.js";
import { ProjectItem } from "./project-item.js";
import { Project } from "../models/project.js";
import { ProjectStatus } from "../models/project.js";
import { AutoBind } from "../decorators/autobind.js";
import { projectState } from "../state/project-state.js";
import { DragTarget } from "../models/drag-drop.js";

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
    assignedProjects: Project[] = [];
  
    constructor(private type: "active" | "finished") {
      super("project-list", "app", false, `${type}-projects`)
      this.configure();
      this.renderContent();
    }
    @AutoBind
    dragOverHandler(event: DragEvent): void {
      if(event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
        event.preventDefault();
        const listEl = this.element.querySelector("ul");
        listEl?.classList.add("droppable")
      }
  
    }
    @AutoBind
    dragLeaveHandler(_: Event): void {
      const listEl = this.element.querySelector("ul");
      listEl?.classList.remove("droppable")
    }
    @AutoBind
    dropHandler(event: DragEvent): void {
      const itemId = event.dataTransfer?.getData("text/plain")!
      projectState.moveProject(itemId, this.type === "active" ? ProjectStatus.ACTIVE : ProjectStatus.FINISHED)
    }
  
    protected configure(): void {
      this.element.addEventListener("dragover", this.dragOverHandler)
      this.element.addEventListener("dragleave", this.dragLeaveHandler)
      this.element.addEventListener("drop", this.dropHandler)
      projectState.addListener((projects: Project[]) => {
        const relevantProjects = projects.filter((pr) => {
          if (this.type === "active") {
            return pr.status === ProjectStatus.ACTIVE
          }
          return pr.status === ProjectStatus.FINISHED
        })
        this.assignedProjects = relevantProjects;
        this.renderProjects();
      });
    }
    renderProjects() {
      const listEl = document.getElementById(
        `${this.type}-projects-list`
      )! as HTMLUListElement;
      listEl.innerHTML = ""
      this.assignedProjects.forEach((projectItem) => {
        new ProjectItem(this.element.querySelector("ul")!.id, projectItem)
      });
    }
  
    renderContent() {
      const listId = `${this.type}-projects-list`;
      this.element.querySelector("ul")!.id = listId;
      this.element.querySelector(
        "h2"
      )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
  }