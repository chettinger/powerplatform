import * as React from 'react'
import { ComboBox, IComboBoxOption, IComboBoxStyles } from '@fluentui/react/lib/ComboBox'

export interface IRecordSelectorProps {
    selectedRecordId: string | undefined;
    availableOptions: IComboBoxOption[];
    autoComplete: boolean;
    onChange: (selectedOption?: IComboBoxOption) => void;
}

export const RecordSelector: React.FunctionComponent<IRecordSelectorProps> = (props) => {
  const comboStyles: Partial<IComboBoxStyles> = {
    root: [
      {
        border: 'none !important',
        borderRadius: '0px',
        backgroundColor: '#f8f8f8',
        height: '32px',
        fontSize: '14px',
        fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
        color: '#323130',
        minHeight: '32px',
        outline: 'none !important',
        boxShadow: 'none !important',
        selectors: {
          ':hover': {
            border: 'none !important',
            outline: 'none !important',
            boxShadow: 'none !important'
          },
          ':focus-within': {
            border: 'none !important',
            outline: 'none !important',
            boxShadow: 'none !important'
          },
          ':focus': {
            border: 'none !important',
            outline: 'none !important',
            boxShadow: 'none !important'
          },
          ':active': {
            border: 'none !important',
            outline: 'none !important',
            boxShadow: 'none !important'
          }
        }
      }
    ],
    input: [
      {
        border: 'none !important',
        outline: 'none !important',
        backgroundColor: '#f8f8f8',
        padding: '0 8px 0 12px',
        height: '30px',
        lineHeight: '30px',
        fontSize: '14px',
        color: '#323130',
        fontFamily: 'inherit',
        boxShadow: 'none !important',
        selectors: {
          '::placeholder': {
            color: '#666666'
          },
          ':focus': {
            outline: 'none !important',
            backgroundColor: '#f8f8f8',
            border: 'none !important',
            boxShadow: 'none !important'
          },
          ':hover': {
            outline: 'none !important',
            border: 'none !important',
            boxShadow: 'none !important'
          },
          ':active': {
            outline: 'none !important',
            border: 'none !important',
            boxShadow: 'none !important'
          }
        }
      }    ],
    container: [
      {
        border: 'none !important',
        outline: 'none !important',
        boxShadow: 'none !important',
        selectors: {
          ':hover': {
            border: 'none !important',
            outline: 'none !important',
            boxShadow: 'none !important'
          },
          ':focus': {
            border: 'none !important',
            outline: 'none !important',
            boxShadow: 'none !important'
          },
          ':focus-within': {
            border: 'none !important',
            outline: 'none !important',
            boxShadow: 'none !important'
          }
        }
      }                                                   
    ],
    inputDisabled: [
      {
        border: 'none !important',
        outline: 'none !important',
        boxShadow: 'none !important'
      }
    ],
    errorMessage: [
      {
        border: 'none !important',
        outline: 'none !important'
      }
    ],
    callout: [
      {
        border: '1px solid #d1d1d1',
        borderRadius: '0px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff'
      }
    ]
  }
  return (
        <ComboBox
            selectedKey={props.selectedRecordId}
            options={props.availableOptions}
            autoComplete={props.autoComplete ? 'on' : 'off'}
            allowFreeform={true}
            onChange={(e: unknown, option?: IComboBoxOption) => {
              props.onChange(option)
            }}
            styles={comboStyles}
        />
  )
}


