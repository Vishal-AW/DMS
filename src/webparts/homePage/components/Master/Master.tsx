import * as React from "react";
import { useState, useEffect } from 'react';
import styles from '../Master/Master.module.scss';
//import { HTTPServices, _getListItem } from "../../../HTTPServices";
import {
  DefaultButton, Panel, PanelType, TextField, Toggle, Dropdown, IDropdownStyles,
  IDropdownOption, Checkbox, ChoiceGroup, IChoiceGroupOption,
  IIconProps,
  IconButton
} from 'office-ui-fabric-react';
import { PeoplePicker, PrincipalType, IPeoplePickerContext } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import MessageDialog from '../ResuableComponents/PopupBox';
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import { IStackItemStyles, IStackStyles, IStackTokens, Stack, FontIcon } from 'office-ui-fabric-react';
import { getTileAllData, SaveTileSetting } from "../../../../Services/MasTileService";
import { GetAllLabel } from "../../../../Services/ControlLabel";
//import { FilePicker, IFilePickerResult } from '@pnp/spfx-controls-react/lib/FilePicker';
//import MaterialTable from "material-table";
import { Accordion, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useBoolean } from '@fluentui/react-hooks';
import { ILabel } from '../Interface/ILabel';
import { getUserIdFromLoginName, uuidv4 } from "../../../../DAL/Commonfile";
import { UploadDocument } from "../../../../Services/DMSTileDocumentService";
import { getConfigActive } from "../../../../Services/ConfigService";
//import { getConfigActive } from "../../../../Services/ConfigService";


//import {WebPartContext} from '@microsoft/sp-webpart-base'
//import type { IHomePageProps } from '../IHomePageProps';


export default function Master({ props }: any): JSX.Element {

  //const _spService = new HTTPServices();
  const [showModal, setShowModal] = useState(false);
  // const [preview, setPreview] = useState(false);
  // const [download, setDownload] = useState(false);
  // const [rename, setRename] = useState(false);
  // const [versions, setVersions] = useState(false);
  const [Years, setYYYY] = useState(false);
  const [years1, setYYY] = useState(false);
  const [monthsdate, setMM] = useState(false);
  const toggleModal = () => setShowModal(!showModal);
  //const [showDialog, setShowDialog] = useState(false);
  //const [dialogMessage, setDialogMessage] = useState('');
  //const [isOpen, setIsOpen] = useState(false);
  const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
  //const [isPopupVisible, { setFalse: hidePopup }] = useBoolean(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [TileAdminselectedUsers, setTileAdminSelectedUsers] = useState<any[]>([]);
  const [TileName, setTileName] = useState("");
  const [TileError, setTileErr] = useState("");
  const [DisplayLabel, setDisplayLabel] = useState<ILabel>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  //const [attachments, setAttachments]: any = useState([]);
  const [assignName, setAssignName] = useState<string>("");
  const [assignID, setAssignID] = useState<string[]>([]);
  const [TileAdminName, setTileAdminName] = useState<string>("");
  const [TileAdminID, setTileAdminID] = useState<string[]>([]);
  const [configData, setConfigData] = useState([]);

  //const[GetMainTileData,setGetTileMAinData]= useState([]);



  const [isTileStatus, setIsTileStatus] = React.useState<boolean>(false);
  const [isAllowApprover, setIsAllowApprover] = React.useState<boolean>(false);
  const [isDropdownVisible, setIsDropdownVisible] = React.useState<boolean>(false);

  const [DynamicDataReference, setDynamicDataReference] = React.useState<boolean>(false);
  const [IsArchiveAllowed, setArchiveAllowed] = React.useState<boolean>(false);
  // const [IsRequired, setIsRequired] = React.useState<boolean>(true);
  // const [Fieldstatus, setFieldstatus] = React.useState<boolean>(true);
  // const [FieldAllowinFile, setFieldAllowinFile] = React.useState<boolean>(true);
  // const [SearchFilterRequired, setSearchFilterRequired] = React.useState<boolean>(true);
  const [selectedcheckboxActions, setSelectedcheckboxActions] = useState<string[]>([]);
  const actions = ["Preview", "Download", "Rename", "Versions"];
  const addIcon: IIconProps = { iconName: 'Add' };
  const saveIcon: IIconProps = { iconName: 'Save' };
  const editIcon: IIconProps = { iconName: 'Edit' };
  const deleteIcon: IIconProps = { iconName: 'Delete' };
  //const cancelIcon: IIconProps = { iconName: 'Cancel' };




  const handleCheckboxChange = (action: string, isChecked: boolean | undefined) => {
    setSelectedcheckboxActions((prevActions) =>
      isChecked
        ? [...prevActions, action]
        : prevActions.filter((item) => item !== action)
    );
  };


  const [tableData, setTableData] = useState<any[]>([]);

  // State for the form fields
  const [formData, setFormData] = useState({
    field: { key: '', text: '' },
    isRequired: false,
    fieldStatus: false,
    isFieldAllowInFile: false,
    searchFilterRequired: false,
    editingIndex: -1,
  });


  // Handle input change
  const handleInputChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleInputChange1 = (event: any, option: any) => {
    setFormData({ ...formData, field: option });
  };

  // Add or update row
  const handleSave = () => {
    if (formData.editingIndex >= 0) {
      // Update existing row
      const updatedData = [...tableData];
      updatedData[formData.editingIndex] = { ...formData };
      delete updatedData[formData.editingIndex].editingIndex;
      setTableData(updatedData);
    } else {
      // Add new row
      setTableData([...tableData, { ...formData }]);
    }

    // Reset form
    setFormData({
      field: { key: '', text: '' },
      isRequired: false,
      fieldStatus: false,
      isFieldAllowInFile: false,
      searchFilterRequired: false,
      editingIndex: -1,
    });
  };

  // Edit row
  const handleEdit = (index: number) => {
    setFormData({ ...tableData[index], editingIndex: index });


  };

  // Delete row
  const handleDelete = (index: number) => {
    const updatedData = tableData.filter((_, i) => i !== index);
    setTableData(updatedData);
  };






  //setTileRefernceNo("2024-00001");

  // const addAttachment = useCallback((obj: any) => {
  //   setAttachments([...attachments, obj]);
  // }, [attachments]);
  const handleTileStatusToggleChange = (checked: boolean): void => {
    setIsTileStatus(checked);
  };
  const handleAllowApproverToggleChange = (checked: boolean): void => {
    setIsAllowApprover(checked);
  };
  const handleToggleChange = (checked: boolean): void => {
    setIsDropdownVisible(checked);
  };
  // const handleIsRequiredToggleChange = (checked: boolean): void => {
  //   setIsRequired(checked);
  // };
  // const handleFieldstatusToggleChange = (checked: boolean): void => {
  //   setFieldstatus(checked);
  // };
  // const handleFieldAllowinFileToggleChange = (checked: boolean): void => {
  //   setFieldAllowinFile(checked);
  // };
  // const handleSearchFilterRequiredToggleChange = (checked: boolean): void => {
  //   setSearchFilterRequired(checked);
  // };
  const ToggleChangeforrefernceno = (checked: boolean): void => {
    setDynamicDataReference(checked);
  };
  const ToggleChangeforArchiveAllowed = (checked: boolean): void => {
    setArchiveAllowed(checked);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
    // const filesData = event.target.files; // FileList object
    // if (filesData && filesData.length > 0) {
    //   setSelectedFile(Array.from(filesData)); // Convert FileList to File[]
    // } else {
    //   setSelectedFile(null); // No files selected
    // }
  };


  useEffect(() => {

    let DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}'); //localStorage.getItem('DisplayLabel')|| null;
    setDisplayLabel(DisplayLabel);
    clearField();
    //fetchData();
    getAllData();
    ConfigMasterData();
    GetMainListData();

  }, []);

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

  const onPeoplePickerChange = (items: any[]) => {
    //console.log("Selected users:", items);
    setSelectedUsers(items);
    console.log("Users to process:", selectedUsers);
    let Users = Array.prototype.map.call(items, (item: any) => {
      return item.id;
    });

    if (items.length > 0) {
      setAssignName(items[0].text);
      setAssignID(Users);
    } else {
      setAssignName("");
      setAssignID([]);

      console.log(assignName);
      console.log(assignID);
    }
  };


  const onTilePeoplePickerChange = (items: any[]) => {
    //console.log("Selected users:", items);
    setTileAdminSelectedUsers(items);
    console.log("Users to process:", TileAdminselectedUsers);
    let TileUsers = Array.prototype.map.call(items, (item: any) => {
      return item.id;
    });

    if (items.length > 0) {
      setTileAdminName(items[0].text);
      setTileAdminID(TileUsers);
    } else {
      setTileAdminName("");
      setTileAdminID([]);

      console.log(TileAdminName);
      console.log(TileAdminID);
    }
  };

  const peoplePickerContext: IPeoplePickerContext = {
    absoluteUrl: props.context.pageContext.web.absoluteUrl,
    msGraphClientFactory: props.context.msGraphClientFactory,
    spHttpClient: props.context.spHttpClient
  };


  const GetMainListData = async () => {
    let GetTileMAinData: any = await getTileAllData(props.SiteURL, props.spHttpClient);
    // let MainDataArray: any = [];
    // MainDataArray = GetTileMAinData.value;

    console.log(GetTileMAinData);
  };


  const getAllData = async () => {
    let data: any = await GetAllLabel(props.SiteURL, props.spHttpClient, "DefaultText");
    console.log(data);
  };


  const ConfigMasterData = async () => {

    let ConfigData: any = await getConfigActive(props.SiteURL, props.spHttpClient);

    let ConfigvalueData = ConfigData.value;

    console.log(ConfigvalueData);


    let options: any = [];

    ConfigvalueData.forEach((InternalTitleNameData: { ID: any; InternalTitleName: any; }) => {

      options.push({

        key: InternalTitleNameData.ID,

        text: InternalTitleNameData.InternalTitleName

      });

    });

    setConfigData(options);
  }

  const clearField = () => {

    setTileName("");
    setAssignID([]);
    setTileAdminID([]);
    clearError();

  };
  const clearError = () => {

    setTileErr('');
  };


  const submitTileData = () => {
    clearError();
    let valid = validation();
    valid ? saveData() : "";
  };

  const validation = () => {
    let isValidForm = true;
    if (TileName === "" || TileName === undefined || TileName === null) {
      setTileErr('Tile name is required');
      isValidForm = false;

    }
    return isValidForm;
  }


  const saveAttachment = async (MainTileID: any) => {

    if (!selectedFile) {
      console.error("No files selected for upload.");
      return;
    }
    let Fileuniqueid = await uuidv4();
    let obj = {
      __metadata: { type: "SP.Data.DMS_x005f_TileDocumentItem" },
      TileLID: MainTileID,
      Documentpath: selectedFile.name
    };
    let displayName = Fileuniqueid + '-' + selectedFile.name;
    await UploadDocument(props.SiteURL, props.spHttpClient, selectedFile, displayName, obj);


  };


  const saveData = async () => {

    let uniqueid = await uuidv4();

    console.log(uniqueid);

    let siteurl = "";

    if (selectedFile) {
      const backImageActualName = selectedFile.name.split(".")[0].replace(/[^a-zA-Z0-9]/g, "");
      const backImageName = `${backImageActualName}.${selectedFile.name.split(".")[1]}`;
      siteurl = `${props.SiteURL}/DMS_TileDocument/${uniqueid}-${backImageName}`;
      console.log(siteurl);
    } else {
      console.log("No file selected.");
    }

    const userIds = await Promise.all(
      assignID.map(async (person: any) => {
        const user = await getUserIdFromLoginName(props.context, person);
        return user.Id;
      })
    );

    const TilesIds = await Promise.all(
      TileAdminID.map(async (person: any) => {
        const user = await getUserIdFromLoginName(props.context, person);
        return user.Id;
      })
    );
    let orderData;
    if (isDropdownVisible == true) {

      orderData = isDropdownVisible;
      console.log(orderData);
    }
    else {
      const maindata = await getTileAllData(props.SiteURL, props.spHttpClient);
      let Dataval = maindata.value.length;

      if (Dataval == null) {
        orderData = 1;
      }
      else {
        orderData = Dataval + 1;
      }

    }

    let option = {
      __metadata: { type: "SP.Data.DMS_x005f_Mas_x005f_TileListItem" },
      TileName: TileName,
      PermissionId: { results: userIds },
      TileAdminId: TilesIds[0],
      AllowApprover: isAllowApprover,
      Active: isTileStatus,
      IsDynamicReference: DynamicDataReference,
      ShowMoreActions: selectedcheckboxActions.join(";"),
      Order0: orderData,
      Documentpath: siteurl
      // ReferenceFormula: TileRefernceno,

    }
    let LID = await SaveTileSetting(props.SiteURL, props.spHttpClient, option);
    { showPopup }
    console.log(LID);
    let MainTileID = LID.Id;

    if (LID != null) {


      saveAttachment(MainTileID);

    }


  };



  const columns = [
    { Header: 'TILES', accessor: 'TILES' },
    { Header: 'ALLOW APPROVER', accessor: 'ALLOWAPPROVER' },
    { Header: 'LAST MODIFIED', accessor: 'uploadedOn' },
    { Header: 'ACTIVE', accessor: 'ACTIVE' },
    { Header: 'ACTION', accessor: 'ACTION' },

  ];

  const data = [
    {
      TILES: 1,
      ALLOWAPPROVER: 'No',
      uploadedOn: 'AscenWork-Prajesh Borkar 04-09-2024 at 03:02:25 PM',
      ACTIVE: 'Yes',
      ACTION: <FontIcon aria-label="Edit" onClick={toggleModal} iconName="EditSolid12" style={{ color: '#009ef7', cursor: 'pointer' }}></FontIcon>,

    },
  ];



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



  const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { width: 250 },
  };



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

  const stackStyles: IStackStyles = { root: { height: "100vh", marginTop: 15 } };
  const stackItemStyles: IStackItemStyles = {
    root: {
      padding: 10,
      border: "1px solid #ddd",
      overflow: "auto",
      background: "#fff",
      boxShadow: "0 10px 30px 0 rgba(82, 63, 105, .05)"
    },
  };
  const stackTokens: IStackTokens = { childrenGap: 10 };


  return (

    <div>
      <div>

        <div className={styles.alignbutton} >
          <DefaultButton id="requestButton" className={styles.submit} text="+ ADD" onClick={toggleModal}  ></DefaultButton>
        </div>

        <Stack horizontal styles={stackStyles} tokens={stackTokens}>
          <Stack.Item grow={2} styles={stackItemStyles}>
            <ReactTableComponent
              TableClassName={styles.ReactTables}
              Tablecolumns={columns}
              Tabledata={data}
              PagedefaultSize={10}
              TableRows={1}
              TableshowPagination={data.length > 10}
              TableshowFilter={true}
            />
          </Stack.Item>
        </Stack>



        <Panel
          headerText=""
          isOpen={showModal}
          onDismiss={toggleModal}
          // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
          closeButtonAriaLabel="Close"
          type={PanelType.large}
          isFooterAtBottom={true}
        >
          <h6 className={styles.Headerlabel}>{DisplayLabel?.AddTileManagement}</h6><hr />

          <Accordion alwaysOpen >
            <Accordion.Item eventKey="0">
              <Accordion.Header className={styles.Accodordianherder}>Tile Details</Accordion.Header>
              <Accordion.Body>
                <Form>
                  <div className={`ms-Grid ${styles.inlineFormContainer}`}>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>Tile Name</label>

                        {/* <TextField label="Title" errorMessage={TileError} value={TileName} onChange={(e: any) => { setTileName(e.target.value); }} /> */}
                        <TextField
                          placeholder="Enter Tile Name"
                          // onChange={(e: any) => { setTileName(e.target.value); }}
                          //onChange={(e: any) => { setTileName(e.target.value); }}
                          errorMessage={TileError}
                          value={TileName}
                          onChange={(el: React.ChangeEvent<HTMLInputElement>) => setTileName(el.target.value)}

                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>Display Picture</label>
                        <TextField
                          placeholder=" "
                          // errorMessage={"Please fill this field"}
                          //value={selectedFile}
                          onChange={handleFileChange}
                          //onChange={(el: React.ChangeEvent<HTMLInputElement>) => setSelectedFile()}
                          type="file"
                        />
                        {/* {attachments} */}
                        {selectedFile && <p>Selected File:{selectedFile.name}</p>}
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
                        <PeoplePicker
                          context={peoplePickerContext}
                          personSelectionLimit={5}
                          showtooltip={true}
                          required={true}
                          // searchTextLimit={2}
                          onChange={onPeoplePickerChange}
                          showHiddenInUI={false}
                          principalTypes={[PrincipalType.User]}
                        // resolveDelay={1000} 
                        />

                      </div>
                    </div>

                  </div>
                  <br /><br />
                  <div className={`ms-Grid ${styles.inlineFormContainer2}`}>
                    <div className="col-md-2">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>Tile Status</label>
                        <Toggle checked={isTileStatus} onChange={(_, checked) => handleTileStatusToggleChange(checked!)} />
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>Allow Approver</label>
                        <Toggle checked={isAllowApprover} onChange={(_, checked) => handleAllowApproverToggleChange(checked!)} />
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
                        <PeoplePicker
                          context={peoplePickerContext}
                          showtooltip={true}
                          required={true}
                          onChange={onTilePeoplePickerChange}
                          showHiddenInUI={false}
                          principalTypes={[PrincipalType.User]}
                        />
                        {/* <TextField
                          placeholder=" "
                          //errorMessage={"Please fill this field"}
                          value={""}
                        /> */}
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
                      {/* <Checkbox label="Preview" checked={preview} onChange={(e, checked) => setPreview(!!checked)} />
                      <Checkbox label="Download" checked={download} onChange={(e, checked) => setDownload(!!checked)} />
                      <Checkbox label="Rename" checked={rename} onChange={(e, checked) => setRename(!!checked)} />
                      <Checkbox label="Versions" checked={versions} onChange={(e, checked) => setVersions(!!checked)} /> */}

                      {actions.map((action) => (
                        <Checkbox
                          label={action}
                          key={action}
                          onChange={(e, isChecked) => handleCheckboxChange(action, isChecked)}
                        />
                      ))}
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

                      <tr style={{ borderBottom: '1px solid #ddd' }}>
                        <th style={{ padding: '10px' }}></th>
                        <th style={{ padding: '10px' }}>

                          <Dropdown
                            placeholder="Choose One"
                            options={configData}
                            selectedKey={formData.field?.key}
                            onChange={handleInputChange1}
                          />
                        </th>
                        <th style={{ padding: '10px' }}>
                          <Toggle checked={formData.isRequired} onChange={(e, checked) => handleInputChange('isRequired', checked)} />
                        </th>
                        <th style={{ padding: '10px' }}>
                          <Toggle checked={formData.fieldStatus} onChange={(e, checked) => handleInputChange('fieldStatus', checked)} />
                        </th>
                        <th style={{ padding: '10px' }}>
                          <Toggle checked={formData.isFieldAllowInFile} onChange={(e, checked) => handleInputChange('isFieldAllowInFile', checked)} />
                        </th>
                        <th style={{ padding: '10px' }}>
                          <Toggle checked={formData.searchFilterRequired} onChange={(e, checked) => handleInputChange('searchFilterRequired', checked)} />
                        </th>
                        <th style={{ padding: '10px' }}>
                          {/* <Icon iconName="Add" onClick={handleSave} IIconProps={formData.editingIndex >= 0 ? saveIcon : addIcon} style={{ color: '#009EF7', font: 'bold', cursor: 'pointer' }} /> */}
                          <IconButton
                            iconProps={formData.editingIndex >= 0 ? saveIcon : addIcon}
                            title={formData.editingIndex >= 0 ? 'Update' : 'Add'}
                            ariaLabel={formData.editingIndex >= 0 ? 'Update' : 'Add'}
                            onClick={handleSave}
                            style={{ color: '#009EF7', font: 'bold', cursor: 'pointer' }}
                          />
                          {/* {formData.editingIndex >= 0 && (
                            <IconButton
                              iconProps={cancelIcon}
                              title="Cancel"
                              ariaLabel="Cancel"
                              onClick={() =>
                                setFormData({
                                  field: '',
                                  isRequired: false,
                                  fieldStatus: false,
                                  isFieldAllowInFile: false,
                                  searchFilterRequired: false,
                                  editingIndex: -1,
                                })
                              }
                            />
                          )} */}
                        </th>
                      </tr>
                      <tbody>
                        {tableData.map((row, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{row.field.text}</td>
                            <td>{row.isRequired ? 'Yes' : 'No'}</td>
                            <td>{row.fieldStatus ? 'Yes' : 'No'}</td>
                            <td>{row.isFieldAllowInFile ? 'Yes' : 'No'}</td>
                            <td>{row.searchFilterRequired ? 'Yes' : 'No'}</td>
                            <td>
                              {/* Edit Button */}
                              <IconButton
                                iconProps={editIcon}
                                title="Edit"
                                ariaLabel="Edit"
                                onClick={() => handleEdit(index)}
                                style={{ color: '#009EF7', font: 'bold', cursor: 'pointer' }}
                              />
                              {/* Delete Button */}
                              <IconButton
                                iconProps={deleteIcon}
                                title="Delete"
                                ariaLabel="Delete"
                                onClick={() => handleDelete(index)}
                                style={{ color: 'red', font: 'bold', cursor: 'pointer' }}
                              />
                            </td>
                          </tr>
                        ))}
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
                            value={"2024-0001"}
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

              {/* <DefaultButton onClick={submitTileData} text={DisplayLabel?.Draft} className={styles['sub-btn']} /> */}

              <DefaultButton onClick={submitTileData} text="Save" className={styles['sub-btn']} />
              <MessageDialog isPopupBoxVisible={isPopupVisible} hidePopup={hidePopup} />


              <DefaultButton text="Cancel" onClick={toggleModal} className={styles['can-btn']} allowDisabledFocus />

            </div>

          </div>

        </Panel>

      </div>
    </div>
  )
}



