# Contributing to AIS PCF Control Library

Thank you for your interest in contributing to the AIS PCF Control Library! We appreciate your help in making this a valuable resource for the Power Apps community.

## Getting Started

1.  **Fork the repository** (if applicable).
2.  **Clone your fork** to your local machine.
3.  **Ensure you have the prerequisites** installed (Node.js, Power Platform CLI).

## Adding a New Control

Here's a step-by-step guide to adding a new PCF control to the library:

1.  **Create a New Control Project**:
    *   Navigate to the root `PCFControls` directory.
    *   Use the Power Platform CLI to initialize a new control project:
        ```bash
        pac pcf init --namespace AIS --name <YourControlName> --template field --run-npm-install
        ```
        Replace `<YourControlName>` with the desired name of your control (e.g., `MyNewLabelControl`).
        This will create a new folder named `<YourControlName>` with the basic PCF control structure.

    ```mermaid
    graph TD
        A[Start] --> B{Run pac pcf init};
        B -- Success --> C[New Control Folder Created];
        C --> D[ControlManifest.input.xml];
        C --> E[index.ts];
        C --> F[package.json];
        C --> G[Other PCF files];
    ```

2.  **Develop Your Control**:
    *   Open the newly created control folder (e.g., `cd <YourControlName>`).
    *   Implement your control logic in `index.ts`.
    *   Define properties, resources, and features in `ControlManifest.input.xml`.
    *   Add any necessary web resources (CSS, images) to the project.
    *   Refer to the [PCF Component Implementation Guide](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/implementing-controls-using-typescript) for detailed development instructions.

3.  **Test Your Control**:
    *   Use the local PCF test harness to test your control:
        ```bash
        npm start watch
        ```
        This will open the control in a local browser session, allowing you to interact with it and debug.

4.  **Build Your Control**:
    *   Once development and testing are complete, build the control:
        ```bash
        npm run build
        ```

5.  **Document Your Control**:
    *   Add a section for your new control in the main `README.md` file, including:
        *   A brief description of what the control does.
        *   Any specific setup or usage instructions.
        *   Screenshots or GIFs if helpful.
    *   If your control has complex configuration or many properties, consider adding a separate `README.md` within your control's folder.

6.  **Update the Library Structure**:
    *   Ensure your new control folder is at the root of the `PCFControls` directory, alongside existing controls.

    ```mermaid
    graph TD
        Root[PCFControls Directory] --> C1[LookupToDropDown];
        Root --> C2[LookupToComboBox];
        Root --> C3[RRule];
        Root --> NewC{YourNewControl Added};
    ```

7.  **Submit a Pull Request** (if applicable):
    *   Commit your changes.
    *   Push to your forked repository.
    *   Create a pull request to the main AIS PCF Control Library repository.
    *   Clearly describe the control you've added and any relevant details in the pull request description.

## Coding Standards

*   Follow TypeScript best practices.
*   Keep code clean, well-commented, and easy to understand.
*   Ensure control names and namespaces are consistent (use `AIS` as the namespace).
*   Optimize for performance and accessibility where possible.

## Questions or Issues?

If you have questions or encounter issues, please open an issue on the GitHub repository.
