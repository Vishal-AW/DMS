import * as React from "react";
import { useState } from 'react';
import styles from '../Master/Master.module.scss';
import {
  DefaultButton, Panel, PanelType, TextField, Toggle, Dropdown, IDropdownStyles,
  IDropdownOption, Checkbox, Icon, ChoiceGroup, IChoiceGroupOption
} from 'office-ui-fabric-react';
import MessageDialog from '../ResuableComponents/MessageDialog';
//import { FilePicker, IFilePickerResult } from '@pnp/spfx-controls-react/lib/FilePicker';
//import MaterialTable from "material-table";
import { Accordion, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useBoolean } from '@fluentui/react-hooks'
//import {WebPartContext} from '@microsoft/sp-webpart-base'
//import type { IHomePageProps } from '../IHomePageProps';


export default function Master({ props }: any): JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(false);
  const [download, setDownload] = useState(false);
  const [rename, setRename] = useState(false);
  const [versions, setVersions] = useState(false);
  const [Years, setYYYY] = useState(false);
  const [years1, setYYY] = useState(false);
  const [monthsdate, setMM] = useState(false);
  const toggleModal = () => setShowModal(!showModal);
  //const [showDialog, setShowDialog] = useState(false);
  //const [dialogMessage, setDialogMessage] = useState('');
  const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);


  // const openDialog = () => {
  //   setDialogMessage('Save Data Successfully.');
  //   setShowDialog(true);
  // };

  // Function to handle dialog actions (e.g., Submit or Close)
  // const handleDialogAction = (action: string) => {
  //   console.log(`Dialog action: ${action}`);
  //   setShowDialog(false); // Close the dialog
  // };

  //const [selectedFields, setSelectedFields] = useState<string[]>([]);


  // const ChangeSettingdropdownOptions: IDropdownOption[] = [
  //   { key: 'separator', text: 'Separator' },
  //   { key: 'concat', text: 'concat' },
  // ];


  // const onChange = React.useCallback(
  //   (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean): void => {
  //     setPreview(!!checked);
  //     setDownload(!!checked);
  //     setRename(!!checked);
  //     setVersions(!!checked);
  //   },
  //   [],
  // );




  const choiceoptions: IChoiceGroupOption[] = [
    { key: 'Hyphens ( - )', text: 'Hyphens ( - )' },
    { key: 'Slash ( / )', text: 'Slash ( / )' },

  ];

  const InitialIncrementoptions: IChoiceGroupOption[] = [
    { key: 'Continue ', text: 'Continue' },
    { key: 'Monthly', text: 'Monthly' },
    { key: 'Yearly', text: 'Yearly' },
    { key: 'Financial Year', text: 'Financial Year' },
    { key: 'Manual', text: 'Manual' },

  ];

  function _onChange(ev: React.FormEvent<HTMLInputElement>, option: IChoiceGroupOption): void {
    console.dir(option);
  }

  function _onChangeInitialIncrement(ev: React.FormEvent<HTMLInputElement>, option: IChoiceGroupOption): void {
    console.dir(option);
  }

  const [isDropdownVisible, setIsDropdownVisible] = React.useState<boolean>(false);
  const [DynamicDataReference, setDynamicDataReference] = React.useState<boolean>(false);
  const [IsArchiveAllowed, setArchiveAllowed] = React.useState<boolean>(false);
  const [IsRequired, setIsRequired] = React.useState<boolean>(true);
  const [Fieldstatus, setFieldstatus] = React.useState<boolean>(true);
  const [FieldAllowinFile, setFieldAllowinFile] = React.useState<boolean>(true);
  const [SearchFilterRequired, setSearchFilterRequired] = React.useState<boolean>(true);


  const handleToggleChange = (checked: boolean): void => {
    setIsDropdownVisible(checked);


  };

  const handleIsRequiredToggleChange = (checked: boolean): void => {
    setIsRequired(checked);


  };
  const handleFieldstatusToggleChange = (checked: boolean): void => {
    setFieldstatus(checked);


  };
  const handleFieldAllowinFileToggleChange = (checked: boolean): void => {
    setFieldAllowinFile(checked);


  };
  const handleSearchFilterRequiredToggleChange = (checked: boolean): void => {
    setSearchFilterRequired(checked);


  };






  const ToggleChangeforrefernceno = (checked: boolean): void => {

    setDynamicDataReference(checked);
  };

  const ToggleChangeforArchiveAllowed = (checked: boolean): void => {

    setArchiveAllowed(checked);
  };

  const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { width: 250 },
  };

  const [tableData, setTableData] = useState<any[]>([]);

  // Adding a new row to the table
  const addRow = () => {
    setTableData([
      ...tableData,
      {
        sequenceNo: tableData.length + 1,
        field: '',
        isRequired: true,
        fieldStatus: true,
        isFieldAllowed: true,
        isSearchFilterRequired: true,
      },
    ]);
  };

  // const deleteRow = (index: number) => {
  //   const updatedData = tableData.filter((_, i) => i !== index);
  //   setTableData(updatedData);
  //   };

  const dropdownOptions: IDropdownOption[] = [
    { key: 'Arbitration', text: 'Arbitration' },
    { key: 'Brand Name', text: 'Brand Name' },
    { key: 'City', text: 'City' },
    { key: 'Confidentiality', text: 'Confidentiality' },
    { key: 'Consequences on expiry', text: 'Consequences on expiry' },
  ];

  const SelectArchiveDaysoptions: IDropdownOption[] = [

    { key: '15', text: '15' },
    { key: '30', text: '30' },
    { key: '60', text: '60' },
    { key: '90', text: '90' },
    { key: '120', text: '120' },

  ];

  const options: IDropdownOption[] = [

    { key: '1', text: '1' },
    { key: '2', text: '2' },
    { key: '3', text: '3' },
    { key: '4', text: '4' },
    { key: '5', text: '5' },
    { key: '6', text: '6' },
    { key: '7', text: '7' },
  ];
  return (

    <div>
      <div>

        <div className={styles.alignbutton} >
          <DefaultButton id="requestButton" className={styles.submit} text="+ ADD" onClick={toggleModal}  ></DefaultButton>
        </div>

        <Panel
          headerText=""
          isOpen={showModal}
          onDismiss={toggleModal}
          // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
          closeButtonAriaLabel="Close"
          type={PanelType.large}
          isFooterAtBottom={true}
        >
          <h6 className={styles.Headerlabel}>Add Tile Management</h6><hr />

          <Accordion alwaysOpen >
            <Accordion.Item eventKey="0">
              <Accordion.Header className={styles.Accodordianherder}>Tile Details</Accordion.Header>
              <Accordion.Body>
                <Form>
                  <div className={`ms-Grid ${styles.inlineFormContainer}`}>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>Tile Name</label>
                        <TextField
                          placeholder=" "
                          //errorMessage={"Please fill this field"}
                          value={""}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>Display Picture</label>
                        <TextField
                          placeholder=" "
                          // errorMessage={"Please fill this field"}
                          value={""}
                          type="file"
                        />
                        {/* <FilePicker
                        bingAPIKey="<BING API KEY>"
                        accepts={[".doc", ".docx", ".xls", ".xlsm"]}
                        buttonIcon="FileImage"
                        onSave={(filePickerResult: IFilePickerResult[]) => {
                          // this.setState({ filePickerResult })
                          this.attachment1(filePickerResult);
                        }}
                        context={props.context}
                      /> */}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>Access To Tile</label>
                        <TextField
                          placeholder=" "
                          //errorMessage={"Please fill this field"}
                          value={""}
                        />
                      </div>
                    </div>

                  </div>
                  <br /><br />
                  <div className={`ms-Grid ${styles.inlineFormContainer2}`}>
                    <div className="col-md-2">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>Tile Status</label>
                        <Toggle />
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>Allow Approver</label>
                        <Toggle />
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>Order</label>
                        <Toggle checked={isDropdownVisible} onChange={(_, checked) => handleToggleChange(checked!)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>Tile Admin</label>
                        <TextField
                          placeholder=" "
                          //errorMessage={"Please fill this field"}
                          value={""}
                        />
                      </div>
                    </div>

                  </div>
                  <br /><br />
                  <div className={`ms-Grid`}>

                    <div className="col-md-3">
                      <div className="form-group">
                        {isDropdownVisible && (
                          <><label className={styles.Headerlabel}>Select Order</label><Dropdown
                            placeholder="Select an option"
                            options={options}
                            styles={dropdownStyles} /></>
                        )}
                      </div>
                    </div>

                  </div>

                </Form>
              </Accordion.Body>
            </Accordion.Item>
            <br />
            <Accordion.Item eventKey="1">
              <Accordion.Header className={styles.Accodordianherder}>Fields</Accordion.Header>
              <Accordion.Body>

                <form>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Select More Actions</label>
                    <div
                      style={{
                        display: 'flex',
                        gap: '15px',
                        alignItems: 'center',
                        backgroundColor: '#f5f8fa',
                        color: '#5e6278',
                        padding: '10px',
                        border: '1px solid #f5f8fa',
                      }}
                    >
                      <Checkbox label="Preview" checked={preview} onChange={(e, checked) => setPreview(!!checked)} />
                      <Checkbox label="Download" checked={download} onChange={(e, checked) => setDownload(!!checked)} />
                      <Checkbox label="Rename" checked={rename} onChange={(e, checked) => setRename(!!checked)} />
                      <Checkbox label="Versions" checked={versions} onChange={(e, checked) => setVersions(!!checked)} />
                    </div>
                  </div>

                  <div>
                    <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th>Sr. No.</th>
                          <th>Field</th>
                          <th>Is Required</th>
                          <th>Field Status</th>
                          <th>Is Field Allow in File</th>
                          <th>Search Filter Required</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                          <td style={{ padding: '10px' }}></td>
                          <td style={{ padding: '10px' }}>
                            <Dropdown
                              placeholder="Choose One"
                              options={dropdownOptions}
                            />
                          </td>
                          <td style={{ padding: '10px' }}>
                            <Toggle checked={IsRequired} onChange={(_, checked) => handleIsRequiredToggleChange(checked!)} />
                          </td>
                          <td style={{ padding: '10px' }}>
                            <Toggle checked={Fieldstatus} onChange={(_, checked) => handleFieldstatusToggleChange(checked!)} />
                          </td>
                          <td style={{ padding: '10px' }}>
                            <Toggle checked={FieldAllowinFile} onChange={(_, checked) => handleFieldAllowinFileToggleChange(checked!)} />
                          </td>
                          <td style={{ padding: '10px' }}>
                            <Toggle checked={SearchFilterRequired} onChange={(_, checked) => handleSearchFilterRequiredToggleChange(checked!)} />
                          </td>
                          <td style={{ padding: '10px' }}>
                            <Icon iconName="Add" onClick={addRow} style={{ color: '#009EF7', font: 'bold', cursor: 'pointer' }} />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                  </div>
                </form>



              </Accordion.Body>
            </Accordion.Item>

            <br />
            <Accordion.Item eventKey="2">
              <Accordion.Header className={styles.Accodordianherder}>Reference No. Details</Accordion.Header>
              <Accordion.Body>
                <Form>

                  <div style={{ marginBottom: '20px' }}>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {/* Dynamic Reference Toggle */}
                      <div className="col-md-3">
                        <label className={styles.Headerlabel}>Is Dynamic Reference</label>
                        <Toggle
                          checked={DynamicDataReference}
                          onChange={(_, checked) => ToggleChangeforrefernceno(checked!)}
                        />
                      </div>

                      {/* Dynamic Reference Example TextField */}
                      {!DynamicDataReference && (
                        <div className="col-md-6">
                          <label className={styles.Headerlabel}>Default Reference Example</label>
                          <TextField
                            placeholder=" "
                            value="2024-00001"
                            disabled
                          />
                        </div>
                      )}

                      {DynamicDataReference && (
                        <div className="col-md-6">
                          <label className={styles.Headerlabel}>Dynamic Reference Example</label>
                          <TextField
                            placeholder=" "
                            value=""
                            disabled
                          />
                        </div>
                      )}
                    </div>


                    {DynamicDataReference && (
                      <div style={{ marginBottom: '20px' }}>

                        <label className={styles.Headerlabel} style={{ marginBottom: '10px', display: 'block' }}>Choose Fields</label>
                        <div
                          style={{
                            display: 'flex',
                            gap: '15px',
                            alignItems: 'center',
                            backgroundColor: '#f5f8fa',
                            color: '#5e6278',
                            padding: '10px',
                            border: '1px solid #f5f8fa',
                          }}
                        >

                          <Checkbox label="YYYY" checked={Years} onChange={(e, checked) => setYYYY(!!checked)} />
                          <Checkbox label="YY_YY" checked={years1} onChange={(e, checked) => setYYY(!!checked)} />
                          <Checkbox label="MM" checked={monthsdate} onChange={(e, checked) => setMM(!!checked)} />

                        </div>

                      </div>
                    )}


                    {DynamicDataReference && (
                      <div style={{ marginBottom: '20px' }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: '20px', // Space between the two choice groups
                            alignItems: 'flex-start', // Align items at the start of each group
                          }}
                        >
                          {/* Separator Choice Group */}
                          <div
                            className="col-md-4"
                            style={{
                              display: 'flex',
                              flexDirection: 'column', // Arrange label and ChoiceGroup vertically
                              gap: '10px',
                              // color: '#5e6278',
                              padding: '10px',
                              //border: '1px solid #f5f8fa',
                              flex: 1, // Make both sections take equal width
                            }}
                          >
                            <label className={styles.Headerlabel} style={{ display: 'block' }}>Separator</label>
                            <ChoiceGroup
                              options={choiceoptions}
                              onChange={_onChange}
                              required={true}
                              defaultSelectedKey="Hyphens ( - )"
                              styles={{
                                flexContainer: {
                                  display: 'flex',
                                  flexDirection: 'row', // Arrange radio buttons horizontally
                                  gap: '10px',
                                  backgroundColor: '#f5f8fa',
                                },
                              }}
                            />
                          </div>

                          {/* Initial Increment Choice Group */}
                          <div
                            className="col-md-8"
                            style={{
                              display: 'flex',
                              flexDirection: 'column', // Arrange label and ChoiceGroup vertically
                              gap: '10px',
                              // backgroundColor: '#f5f8fa',
                              //color: '#5e6278',
                              padding: '10px',
                              //border: '1px solid #f5f8fa',
                              flex: 1, // Make both sections take equal width
                            }}
                          >
                            <label className={styles.Headerlabel} style={{ display: 'block' }}>Initial Increment</label>
                            <ChoiceGroup
                              options={InitialIncrementoptions}
                              onChange={_onChangeInitialIncrement}
                              required={true}
                              defaultSelectedKey="Continue"
                              styles={{
                                flexContainer: {
                                  display: 'flex',
                                  flexDirection: 'row', // Arrange radio buttons horizontally
                                  gap: '10px',
                                  backgroundColor: '#f5f8fa',
                                },
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}<br />

                    {DynamicDataReference && (
                      <div>
                        {/* Choose Fields Section */}

                        <div>
                          <label className={styles.Headerlabel} style={{ display: 'block' }}>Change Setting</label>

                        </div>
                      </div>
                    )}



                  </div>

                </Form>
              </Accordion.Body>
            </Accordion.Item>
            <br />
            <Accordion.Item eventKey="3">
              <Accordion.Header className={styles.Accodordianherder}>Archive Section</Accordion.Header>
              <Accordion.Body>
                <Form>
                  <div style={{ marginBottom: '20px' }}>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {/* Dynamic Reference Toggle */}
                      <div className="col-md-3">
                        <label className={styles.Headerlabel}>Is Archive Allowed</label>
                        <Toggle
                          checked={IsArchiveAllowed}
                          onChange={(_, checked) => ToggleChangeforArchiveAllowed(checked!)}
                        />
                      </div>

                      {IsArchiveAllowed && (
                        <div className="col-md-6">
                          <label className={styles.Headerlabel}>Archive Document Library Name</label>
                          <TextField
                            placeholder=" "
                            value="Archive"
                            disabled
                          />
                        </div>
                      )}
                    </div>

                    {IsArchiveAllowed && (
                      <div style={{ marginBottom: '20px' }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: '20px', // Space between the two choice groups
                            alignItems: 'flex-start', // Align items at the start of each group
                          }}
                        >
                          {/* Separator Choice Group */}
                          <div
                            className="col-md-3"
                            style={{
                              display: 'flex',
                              flexDirection: 'column', // Arrange label and ChoiceGroup vertically
                              gap: '10px',
                              // color: '#5e6278',
                              padding: '10px',
                              //border: '1px solid #f5f8fa',
                              flex: 1, // Make both sections take equal width
                            }}
                          >
                            <label className={styles.Headerlabel} style={{ display: 'block' }}>Select Archive Days</label>
                            <Dropdown
                              placeholder="Choose One"
                              options={SelectArchiveDaysoptions}
                            />
                          </div>

                          {/* Initial Increment Choice Group */}
                          <div
                            className="col-md-6"
                            style={{
                              display: 'flex',
                              flexDirection: 'column', // Arrange label and ChoiceGroup vertically
                              gap: '10px',
                              // backgroundColor: '#f5f8fa',
                              //color: '#5e6278',
                              padding: '10px',
                              //border: '1px solid #f5f8fa',
                              flex: 1, // Make both sections take equal width
                            }}
                          >
                            <label className={styles.Headerlabel} style={{ display: 'block' }}>Archive Versions</label>
                            <TextField
                              placeholder=" "
                              value=""
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <div className={styles.container} >
            <div className={styles.containerOne} >

              {/* <DefaultButton text="Save" className={styles['sub-btn']} allowDisabledFocus onClick={showPopup} />
              {isDatapopvisible && (<MessageDialog />)} */}

              <DefaultButton onClick={showPopup} text="Save" className={styles['sub-btn']} />
              <MessageDialog isPopupVisible={isPopupVisible} hidePopup={hidePopup} />


              <DefaultButton text="Cancel" className={styles['can-btn']} allowDisabledFocus />

            </div>

          </div>

        </Panel>

      </div>
    </div>
  )
}



