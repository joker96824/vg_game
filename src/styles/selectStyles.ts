import { StylesConfig } from 'react-select';

export const customSelectStyles: StylesConfig = {
  control: (base: any) => ({
    ...base,
    minHeight: 24,
    height: 24,
    fontSize: 12,
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: '0 4px',
    minHeight: 24,
    height: 24,
    flexWrap: 'wrap',
    overflow: 'hidden',
  }),
  input: (base: any) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  indicatorsContainer: (base: any) => ({
    ...base,
    height: 24,
  }),
  multiValue: (base: any) => ({
    ...base,
    maxWidth: '80px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  option: (base: any) => ({
    ...base,
    fontSize: 12,
    minHeight: 24,
    height: 24,
    paddingTop: 2,
    paddingBottom: 2,
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
}; 