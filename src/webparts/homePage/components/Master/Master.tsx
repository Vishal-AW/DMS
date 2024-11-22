import * as React from "react";
import { useState } from 'react';
import styles from '../Master/Master.module.scss';
import { DefaultButton, Panel, PanelType, TextField, Toggle, Dropdown, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react';
//import { FilePicker, IFilePickerResult } from '@pnp/spfx-controls-react/lib/FilePicker';
//import MaterialTable from "material-table";
import { Accordion, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
//import {WebPartContext} from '@microsoft/sp-webpart-base'
//import type { IHomePageProps } from '../IHomePageProps';


export default function Master(): JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);


  const [isDropdownVisible, setIsDropdownVisible] = React.useState<boolean>(false);

  const handleToggleChange = (checked: boolean): void => {
    setIsDropdownVisible(checked);
  };

  const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { width: 250 },
  };

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
                        />
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
                <Form>
                  <h4>Test</h4>
                </Form>

              </Accordion.Body>
            </Accordion.Item>

            <br />
            <Accordion.Item eventKey="2">
              <Accordion.Header className={styles.Accodordianherder}>Reference No. Details</Accordion.Header>
              <Accordion.Body>
                <Form>
                  <h4>Test1</h4>
                </Form>
              </Accordion.Body>
            </Accordion.Item>
            <br />
            <Accordion.Item eventKey="3">
              <Accordion.Header className={styles.Accodordianherder}>Archive Section</Accordion.Header>
              <Accordion.Body>
                <Form>
                  <h4>Test2</h4>
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

        </Panel>

      </div>
    </div>
  )
}



