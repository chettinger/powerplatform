/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable @typescript-eslint/no-empty-function */
import { IInputs, IOutputs } from './generated/ManifestTypes'
import * as React from 'react'
import * as ReactDom from 'react-dom'
import { RecordSelector } from './RecordSelector'
import { IComboBoxOption } from '@fluentui/react/lib/ComboBox'

export class LookupToComboBox implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _notifyOutputChanged: () => void;
    private _entityName: string;
    private _viewId: string;
    private _availableOptions: IComboBoxOption[];
    private _currentValue?: ComponentFramework.LookupValue[];
    private _autoComplete: boolean;
    private _logString: string;
    constructor () {      
    }
    
    public init (
      context: ComponentFramework.Context<IInputs>,
      notifyOutputChanged: () => void,
      state: ComponentFramework.Dictionary,
      container: HTMLDivElement
    ): void {
      this._container = container;
      this._notifyOutputChanged = notifyOutputChanged;
      this._logString = `[LookupToComboBox(${(context as unknown as { navigation: { _customControlProperties: { controlId: string } } }).navigation._customControlProperties.controlId})]`;
      console.debug(`${this._logString} Control initializing, getting target entity type from lookup`);

      this._entityName = context.parameters.lookup.getTargetEntityType();
      // Use provided view ID or fall back to the lookup's default view
      this._viewId = context.parameters.lookupViewGuid.raw || context.parameters.lookup.getViewId();
      this._autoComplete = context.parameters.autoComplete.raw === '1' || context.parameters.autoComplete.raw === null;

      console.debug(
            `${this._logString} Target entity type [${this._entityName}] and view id [${this._viewId}] retrieved from context, getting entity metadata`
      );

      context.utils.getEntityMetadata(this._entityName).then((metadata) => {
        const entityIdFieldName = metadata.PrimaryIdAttribute;
        // Use provided display field or fall back to the primary name attribute
        const entityNameFieldName = context.parameters.displayNameField.raw || metadata.PrimaryNameAttribute;

        console.debug(`${this._logString} Using view id [${this._viewId}] to retrieve fetchXML for view`);

        context.webAPI
          .retrieveRecord('savedquery', this._viewId, '?$select=name,fetchxml')
          .then((queryFetchXml) => {
            // const query = `?$select=${entityIdFieldName},${entityNameFieldName}`;
            const query = '?fetchXml=' + queryFetchXml.fetchxml;
            console.info(`${this._logString} Retrieving multiple records using fetchXml [${query}]`);

            context.webAPI.retrieveMultipleRecords(this._entityName, query).then((result) => {
              this._availableOptions = result.entities.map((r) => {
                return {
                  key: r[entityIdFieldName],
                  text: r[entityNameFieldName] ?? 'Display Name is not available'
                };
              });

              this.renderControl(context);
            }).catch((error) => {
              console.error(`${this._logString} Error retrieving records:`, error);
              // Provide empty options array as fallback
              this._availableOptions = [];
              this.renderControl(context);
            });
          }).catch((error) => {
            console.error(`${this._logString} Error retrieving view:`, error);
            // Fallback to simple query without fetchXML
            const query = `?$select=${entityIdFieldName},${entityNameFieldName}`;
            context.webAPI.retrieveMultipleRecords(this._entityName, query).then((result) => {
              this._availableOptions = result.entities.map((r) => {
                return {
                  key: r[entityIdFieldName],
                  text: r[entityNameFieldName] ?? 'Display Name is not available'
                };
              });
              this.renderControl(context);
            }).catch((fallbackError) => {
              console.error(`${this._logString} Fallback query also failed:`, fallbackError);
              this._availableOptions = [];
              this.renderControl(context);
            });
          });
      });
    }    public updateView (context: ComponentFramework.Context<IInputs>): void {
      this.renderControl(context);
      // Ensure borders are removed after any updates
      this.removeBordersFromContainer();
    }

    private renderControl (context: ComponentFramework.Context<IInputs>) {
      const recordId =
            context.parameters.lookup.raw != null && context.parameters.lookup.raw.length > 0
              ? context.parameters.lookup.raw[0].id
              : undefined;

      const recordSelector = React.createElement(RecordSelector, {
        selectedRecordId: recordId,
        availableOptions: this._availableOptions,
        autoComplete: this._autoComplete,
        onChange: (selectedOption?: IComboBoxOption) => {
          if (typeof selectedOption === 'undefined') {
            this._currentValue = undefined;
          } else {
            this._currentValue = [
              {
                id: selectedOption.key as string,
                name: selectedOption.text,
                entityType: this._entityName
              }
            ];
          }
          this._notifyOutputChanged();
        }
      });      ReactDom.render(recordSelector, this._container);
      
      // Override host environment borders and outlines
      this.removeBordersFromContainer();
    }    private removeBordersFromContainer(): void {
      // Remove borders from the container itself
      this._container.style.border = "none !important";
      this._container.style.outline = "none !important";
      this._container.style.boxShadow = "none !important";
      
      // Walk up the DOM tree to remove borders from all parent containers
      let currentElement = this._container.parentElement;
      let level = 0;
      while (currentElement && level < 5) { // Limit to 5 levels to avoid infinite loops
        currentElement.style.border = "none !important";
        currentElement.style.outline = "none !important";
        currentElement.style.boxShadow = "none !important";
        
        // Specifically target Dynamics 365 container classes
        if (currentElement.classList.contains('pa-bx') || 
            currentElement.classList.contains('flexbox') ||
            currentElement.classList.contains('customControl')) {
          currentElement.style.border = "none !important";
          currentElement.style.outline = "none !important";
          currentElement.style.boxShadow = "none !important";
        }
        
        currentElement = currentElement.parentElement;
        level++;
      }
      
      // Use setTimeout to ensure DOM is fully rendered before applying styles
      setTimeout(() => {
        // Target all ComboBox-related elements more aggressively
        const selectors = [
          '.ms-ComboBox-container',
          '.ms-ComboBox',
          '.ms-ComboBox-Input',
          '[data-ktp-target="true"]',
          '[class*="ComboBox"]',
          '[id*="ComboBox"]',
          'input[type="text"]',
          'button.ms-ComboBox-CaretDown-button'
        ];
        
        selectors.forEach(selector => {
          const elements = this._container.querySelectorAll(selector);
          elements.forEach((element: Element) => {
            const htmlElement = element as HTMLElement;
            htmlElement.style.border = "none !important";
            htmlElement.style.outline = "none !important";
            htmlElement.style.boxShadow = "none !important";
          });
        });
        
        // Also target any elements within the document that might be related to our control
        const customControlElement = document.querySelector('.customControl.AIS.LookupToComboBox');
        if (customControlElement) {
          const htmlElement = customControlElement as HTMLElement;
          htmlElement.style.border = "none !important";
          htmlElement.style.outline = "none !important";
          htmlElement.style.boxShadow = "none !important";
          
          // Remove borders from all child elements
          const allChildren = customControlElement.querySelectorAll('*');
          allChildren.forEach((child: Element) => {
            const childElement = child as HTMLElement;
            childElement.style.border = "none !important";
            childElement.style.outline = "none !important";
            childElement.style.boxShadow = "none !important";
          });
        }
      }, 100);
    }

    public getOutputs (): IOutputs {
      return {
        lookup: this._currentValue
      };
    }

    public destroy (): void {
      ReactDom.unmountComponentAtNode(this._container);
    }
}
