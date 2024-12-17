import * as React from "react";
import { useState, useEffect } from 'react';
import * as moment from "moment";
import styles from '../Master/Master.module.scss';
//import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
//import { HTTPServices, _getListItem } from "../../../HTTPServices";
import {
  DefaultButton, Panel, PanelType, TextField, Toggle, Dropdown, IDropdownStyles, Checkbox, ChoiceGroup,
  IIconProps,
  IconButton,
  IDropdownOption,
  FontIcon
} from 'office-ui-fabric-react';
import { PeoplePicker, PrincipalType, IPeoplePickerContext } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import MessageDialog from '../ResuableComponents/PopupBox';
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import { IStackItemStyles, IStackStyles, IStackTokens, Stack } from 'office-ui-fabric-react';
import { getDataById, getTileAllData, SaveTileSetting, UpdateTileSetting } from "../../../../Services/MasTileService";
import { GetAllLabel } from "../../../../Services/ControlLabel";
//import { FilePicker, IFilePickerResult } from '@pnp/spfx-controls-react/lib/FilePicker';
//import MaterialTable from "material-table";
import { Accordion, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useBoolean } from '@fluentui/react-hooks';
import { ILabel } from '../Interface/ILabel';
import { getUserIdFromLoginName, uuidv4 } from "../../../../DAL/Commonfile";
import { GetAttachmentFile, UploadDocument } from "../../../../Services/DMSTileDocumentService";
import { getConfigActive } from "../../../../Services/ConfigService";
import { getActiveRedundancyDays } from "../../../../Services/ArchiveRedundancyDaysService";
import { service } from "../../../../Services/Service";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ISPHttpClientOptions, SPHttpClient } from "@microsoft/sp-http-base";

//import { getConfigActive } from "../../../../Services/ConfigService";


//import {WebPartContext} from '@microsoft/sp-webpart-base'
//import type { IHomePageProps } from '../IHomePageProps';


export default function Master({ props }: any): JSX.Element {
  const _spService: service = new service();

  //const [showModal, setShowModal] = useState(false);
  //const toggleModal = () => setShowModal(!showModal);
  //const [showDialog, setShowDialog] = useState(false);
  //const [dialogMessage, setDialogMessage] = useState('');
  //const [isOpen, setIsOpen] = useState(false);
  const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
  //const [isPopupVisible, { setFalse: hidePopup }] = useBoolean(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [TileAdminselectedUsers, setTileAdminSelectedUsers] = useState<any[]>([]);
  const [TileName, setTileName] = useState("");
  const [TileError, setTileErr] = useState("");
  const [attachmentErr, setAttachmentErr] = useState("");
  const [AccessTileUserErr, setAccessTileUserErr] = useState("");
  const [TileAdminUserErr, setTileAdminUserErr] = useState("");
  const [TileSelectorderErr, setTileSelectorderErr] = useState("");
  const [TileReferenceNoErr, setTileReferenceNoErr] = useState("");
  const [TileRedundancyDaysErr, setTileRedundancyDaysErr] = useState("");
  const [TileArchiveVersionErr, setTileArchiveVersionErr] = useState("");
  const [MainTableSetdata, setData] = useState<any[]>([]);

  // const [DuplicateTileError, setDuplicateTileError] = useState("");
  // const [TileLowerUpperError, setTileLowerUpperError] = useState("");
  const [DisplayLabel, setDisplayLabel] = useState<ILabel>();
  const [selectedFile, setSelectedFile] = useState<File | { name: string } | null>(null);
  //const [attachments, setAttachments]: any = useState([]);
  const [assignName, setAssignName] = useState<string>("");
  const [assignID, setAssignID] = useState([]);
  const [TileAdminName, setTileAdminName] = useState<string>("");
  const [TileAdminID, setTileAdminID] = useState([]);
  const [order0Data, setorder0Data] = useState([]);
  const [RedundancyDataID, setRedundancyDataID] = useState('');
  const [RedundancyDataText, setRedundancyDataText] = useState('');
  const [configData, setConfigData] = useState([]);
  const [RedundancyData, setRedundancyData] = useState([]);
  const [order0DataDataID, setorder0DataDataID] = useState('');
  const [order0DataDataText, setorder0DataText] = useState('');
  const [isToggleDisabled, setIsToggleDisabled] = useState(false);

  const [isTileStatus, setIsTileStatus] = React.useState<boolean>(false);
  const [isAllowApprover, setIsAllowApprover] = React.useState<boolean>(false);
  const [isDropdownVisible, setIsDropdownVisible] = React.useState<boolean>(false);

  const [DynamicDataReference, setDynamicDataReference] = React.useState<boolean>(false);

  const [RefrenceNOData, setRefrenceNOData] = useState<string>('');
  const [ArchiveTest, setArchiveTest] = useState<string>('');
  const [ArchiveVersions, setArchiveVersions] = useState<string>("");

  const [IsArchiveAllowed, setArchiveAllowed] = React.useState<boolean>(false);

  const [selectedcheckboxActions, setSelectedcheckboxActions] = useState<string[]>([]);
  const actions = ["Preview", "Download", "Rename", "Versions"];
  const addIcon: IIconProps = { iconName: 'Add' };
  const saveIcon: IIconProps = { iconName: 'Save' };
  const editIcon: IIconProps = { iconName: 'Edit' };
  const deleteIcon: IIconProps = { iconName: 'Delete' };
  //const cancelIcon: IIconProps = { iconName: 'Cancel' };


  const [refFormatData, setRefFormatData] = useState<string[]>([]);
  const [prefix, setPrefix] = useState<string>("");
  const [separator, setSeparator] = useState<string>("-");
  const [increment, setIncrement] = useState<string>("Continue");
  const [refExample, setRefExample] = useState<string>("");
  const [customSeparators, setCustomSeparators] = useState<{ [key: number]: string }>({});

  const [CurrentEditID, setCurrentEditID] = useState<number>(0);


  const [tableData, setTableData] = useState<any[]>([]);


  const [formData, setFormData] = useState<any>({
    field: '',
    IsRequired: false,
    IsActiveControl: false,
    IsFieldAllowInFile: false,
    isShowAsFilter: false,
    Flag: "New",
    editingIndex: -1,
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const openAddPanel = () => {
    setIsEditMode(false);
    setIsPanelOpen(true);
  };





  const closePanel = () => {
    setIsPanelOpen(false);
  };


  useEffect(() => {

    fetchData();
    let DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}'); //localStorage.getItem('DisplayLabel')|| null;
    setDisplayLabel(DisplayLabel);
    clearField();
    fetchData();
    getAllData();
    ConfigMasterData();
    GetMainListData();
    RedundancyDaysData();
    setRefrenceNOData(`${moment().format('YYYY')}-00001`);
    setRefExample(RefrenceNOData);

    //DashboardDataEdit();

  }, []);



  const fetchData = async () => {
    let FetchallTileData: any = await getTileAllData(props.SiteURL, props.spHttpClient);

    let TilesData = FetchallTileData.value;

    setData(TilesData);

    console.log(TilesData);
  };


  const Tablecolumns = [
    { Header: "TILES", accessor: "TileName" },
    {
      Header: "ALLOW APPROVER",
      accessor: "AllowApprover",
      Cell: ({ row }: { row: any }) => (row.AllowApprover == true ? "Yes" : "No")
    },
    {
      Header: "LAST MODIFIED",
      Cell: ({ row }: { row: any }) => {
        const rowData = row._original;
        const formattedDate = new Date(rowData.Modified).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric"
        });
        const formattedTime = new Date(rowData.Modified).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        });
        return `${rowData.Editor?.Title || "Unknown"} ${formattedDate} at ${formattedTime}`;
      }
    },
    {
      Header: "ACTIVE",
      accessor: "Active",
      Cell: ({ row }: { row: any }) => (row.Active == true ? "Yes" : "No")
    },
    {
      Header: "ACTION",
      Cell: ({ row }: { row: any }) => (
        <FontIcon aria-label="Edit" onClick={() => openEditPanel(row._original.Id)} iconName="EditSolid12" style={{ color: '#009ef7', cursor: 'pointer' }}></FontIcon>
      )
    }
  ];

  const openEditPanel = async (rowData: any) => {

    setIsEditMode(true);
    setIsPanelOpen(true);

    let GetEditData = await getDataById(props.SiteURL, props.spHttpClient, rowData);
    const EditSettingData = GetEditData.value;

    const str: string = EditSettingData[0].ID.toString();

    const CurrentItemId: number = EditSettingData[0].ID;

    setCurrentEditID(CurrentItemId);
    console.log(EditSettingData);


    await setTileName(EditSettingData[0].TileName);

    const AccessTileData: any = EditSettingData[0].Permission ? EditSettingData[0].Permission.map((person: any) => person.EMail) : [];
    await setAssignID(AccessTileData);

    const TileAdminData: any = EditSettingData[0].TileAdmin ? ([EditSettingData[0].TileAdmin.EMail]) : []
    await setTileAdminID(TileAdminData);

    await setIsTileStatus(EditSettingData[0].Active);
    await setIsAllowApprover(EditSettingData[0].AllowApprover);
    await setIsDropdownVisible(EditSettingData[0].AllowOrder);
    if (EditSettingData[0].AllowOrder == true) {
      setorder0DataDataID(EditSettingData[0].Order0);
    }
    else {
      setorder0DataDataID("");
    }

    getAllColumns(EditSettingData[0].LibraryName);
    const actionsData = (EditSettingData[0].ShowMoreActions == null ? [] : EditSettingData[0].ShowMoreActions.split(';'));
    await setSelectedcheckboxActions(actionsData);

    await setTableData(EditSettingData[0].DynamicControl == null ? [] : JSON.parse(EditSettingData[0].DynamicControl));

    await setArchiveAllowed(EditSettingData[0].IsArchiveRequired);


    if (EditSettingData[0].IsArchiveRequired == true) {
      let ActiveRedundancyDaysData: any = await getActiveRedundancyDays(props.SiteURL, props.spHttpClient);
      let ActiveRedundancyDaysvalueData = ActiveRedundancyDaysData.value;
      const FilterRetentionDays = ActiveRedundancyDaysvalueData.filter((item: any) => item.RedundancyDays === EditSettingData[0].RetentionDays);
      const RetentiondaysData = FilterRetentionDays[0].ID;

      await setArchiveTest(EditSettingData[0].ArchiveLibraryName);
      await setArchiveVersions(EditSettingData[0].ArchiveVersionCount);
      await setRedundancyDataID(RetentiondaysData);
    }
    else {
      setArchiveTest("");
      setArchiveVersions("");
      setRedundancyDataID("");
    }
    await setDynamicDataReference(EditSettingData[0].IsDynamicReference);

    if (EditSettingData[0].IsDynamicReference == true) {

      const formula = EditSettingData[0].ReferenceFormula;
      await setRefExample(EditSettingData[0].ReferenceFormula);
      //await setCustomSeparators(EditSettingData[0].Separator);

      const fields = [];
      if (formula.includes("{YYYY}")) fields.push("YYYY");
      if (formula.includes("{YY_YY}")) fields.push("YY_YY");
      if (formula.includes("{MM}")) fields.push("MM");

      const dynamicFieldPattern = /\{([^}]+)\}/g;
      let match;
      while ((match = dynamicFieldPattern.exec(formula)) !== null) {
        const fieldName = (match[1]);

        if (!["YYYY", "YY_YY", "MM", "Continue"].includes(fieldName)) {
          fields.push(fieldName);
        }
      }

      setRefFormatData(fields);


      setSeparator(EditSettingData[0].Separator || "-");
      setIncrement(EditSettingData[0].InitialIncrement || "Continue");
    }
    else {
      await setRefExample(EditSettingData[0].ReferenceFormula);
    }

    let GetAttachmentData: any = await GetAttachmentFile(props.SiteURL, props.spHttpClient, str);

    const GetAttachmentDataValue = GetAttachmentData.value;

    console.log(GetAttachmentDataValue);

    if (GetAttachmentDataValue && GetAttachmentDataValue.length > 0) {

      const existingFile = { name: GetAttachmentData.value[0].Documentpath };
      setSelectedFile(existingFile);

      // setSelectedFile(GetAttachmentData.value[0].File.Name);

    } else {
      setSelectedFile(null);
    }

  };



  const GetListData = async (context: WebPartContext, query: string) => {
    const response = await context.spHttpClient.get(query, SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=verbose',
        'odata-version': '',
      },
    });
    return await response.json();
  };

  const CheckboxData = (obj: any) => {


    let icheckbox;
    if (obj.ColumnType == 'Dropdown' && !obj.IsStaticValue && obj.IsRequired == true && obj.IsFieldAllowInFile != true && obj.IsActiveControl == true) {
      icheckbox = <Checkbox label={obj.Title} checked={refFormatData.includes(obj.Title)} onChange={(e, checked) => handleCheckboxToggle(obj.Title, checked!)} />


    }
    return icheckbox;
  }



  const handleCheckboxToggle = (item: string, isChecked: boolean) => {
    const updatedRefData = isChecked
      ? [...refFormatData, item]
      : refFormatData.filter((refItem) => refItem !== item);
    setRefFormatData(updatedRefData);
    generateFormula(updatedRefData, prefix, separator, increment);
  };

  // Handle prefix change
  const handlePrefixChange = (value: string) => {
    setPrefix(value);
    generateFormula(refFormatData, value, separator, increment);
  };

  // Handle separator or increment change
  const handleRadioChange = (type: string, value: string) => {
    if (type === "separator") {
      setSeparator(value);
      generateFormula(refFormatData, prefix, value, increment);
    } else if (type === "increment") {
      setIncrement(value);
      generateFormula(refFormatData, prefix, separator, value);
    }
  };

  // Handle dropdown change for each row
  const handleDropdownChange = (index: number, value: string) => {
    const updatedSeparators = { ...customSeparators, [index]: value };
    setCustomSeparators(updatedSeparators);
    generateFormula(refFormatData, prefix, separator, increment, updatedSeparators);
  };

  // Generate formula
  // const generateFormula = (
  //   refData: string[],
  //   prefixValue: string,
  //   separatorValue: string,
  //   incrementValue: string,
  //   customSeparatorData: { [key: number]: string } = customSeparators
  // ) => {
  //   let formula = prefixValue ? `${prefixValue}${separatorValue}` : "";

  //   refData.forEach((item, index) => {
  //     formula += `{${item}}`;
  //     // Add separator or concatenate based on dropdown selection
  //     if (customSeparatorData[index] === "Separator") {
  //       formula += separatorValue;
  //     } else if (customSeparatorData[index] === "Concat") {
  //       formula += ""; // No separator, concatenate directly
  //     }
  //   });

  //   // Remove trailing separator if present before adding increment
  //   if (formula.endsWith(separatorValue)) {
  //     formula = formula.slice(0, -separatorValue.length);
  //   }

  //   // Append increment
  //   formula += `{${incrementValue}}`;

  //   setRefExample(formula);
  // };

  // const generateFormula = (
  //   refData: string[],
  //   prefixValue: string,
  //   separatorValue: string,
  //   incrementValue: string,
  //   customSeparatorData: { [key: number]: string } = customSeparators
  // ) => {
  //   let formula = prefixValue ? `${prefixValue}${separatorValue}` : "";

  //   refData.forEach((item, index) => {
  //     formula += `{${item}}`;
  //     // Add separator or concatenate based on dropdown selection
  //     if ((customSeparatorData[index] || "Separator") === "Separator") {
  //       formula += separatorValue;
  //     }
  //   });

  //   // Remove trailing separator if present before adding increment
  //   if (formula.endsWith(separatorValue)) {
  //     formula = formula.slice(0, -separatorValue.length);
  //   }

  //   // Append increment
  //   formula += `{${incrementValue}}`;
  //   setRefExample(formula);
  // };

  const generateFormula = (
    refData: string[],
    prefixValue: string,
    separatorValue: string,
    incrementValue: string,
    customSeparatorData: { [key: number]: string } = customSeparators
  ) => {
    let formula = prefixValue ? `${prefixValue}${separatorValue}` : "";

    refData.forEach((item, index) => {
      formula += `{${item}}`;

      if ((customSeparatorData[index] || "Separator") === "Separator") {
        formula += separatorValue;
      }
    });

    if (formula.endsWith(separatorValue)) {
      formula = formula.slice(0, -separatorValue.length);
    }

    formula += separatorValue;
    formula += `{${incrementValue}}`;
    setRefExample(formula);
  };



  const GetMainListData = async () => {
    let GetTileMAinData: any = await getTileAllData(props.SiteURL, props.spHttpClient);

    console.log(GetTileMAinData);

    let OrdervalueData = GetTileMAinData.value;

    console.log(OrdervalueData);


    let options: any = [];

    OrdervalueData.forEach((Order0Data: { ID: any; Order0: any; }) => {

      options.push({

        key: Order0Data.ID,

        text: Order0Data.Order0

      });

    });

    setorder0Data(options);
  };


  const handleorder0DataDropdownChange = (
    event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    setorder0DataDataID(option?.key as string);
    setorder0DataText(option?.text as string);
    console.log(order0DataDataText);
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

    ConfigvalueData.forEach((InternalTitleNameData: { Title: any; ID: any; InternalTitleName: any; }) => {

      options.push({

        key: InternalTitleNameData.ID,

        text: InternalTitleNameData.Title

      });

    });

    setConfigData(options);
  }

  const RedundancyDaysData = async () => {

    let ActiveRedundancyDaysData: any = await getActiveRedundancyDays(props.SiteURL, props.spHttpClient);

    let ActiveRedundancyDaysvalueData = ActiveRedundancyDaysData.value;

    console.log(ActiveRedundancyDaysvalueData);


    let options: any = [];

    ActiveRedundancyDaysvalueData.forEach((RedundancyDaysData: { RedundancyDays: any; ID: any; RedundancyDaysData: any; }) => {

      options.push({

        key: RedundancyDaysData.ID,

        text: RedundancyDaysData.RedundancyDays

      });

    });

    setRedundancyData(options);
  }


  const handleArchiveDropdownChange = (
    event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    setRedundancyDataID(option?.key as string);
    setRedundancyDataText(option?.text as string);
  };

  const handleCheckboxChange = (action: string, isChecked: boolean | undefined) => {
    setSelectedcheckboxActions((prevActions) =>
      isChecked
        ? [...prevActions, action]
        : prevActions.filter((item) => item !== action)
    );
  };





  // Handle input change
  const handleInputChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleInputChange1 = async (event: any, option: any) => {
    setFormData({ ...formData, field: option.key });

    const TileDataforDropdown = await getConfigActive(props.SiteURL, props.spHttpClient);
    const TileDataValueforDropdown = TileDataforDropdown.value;
    const selectedOption = TileDataValueforDropdown.find((element: any) => element.ID === option.key);
    console.log(selectedOption);

    if (selectedOption) {
      if (selectedOption.IsShowAsFilter) {
        setIsToggleDisabled(false);
      } else {
        setIsToggleDisabled(true);
      }
    }
  };

  // Add or update row
  const handleSave = async () => {
    if (formData.editingIndex >= 0) {



      const updatedData = [...tableData];
      updatedData[formData.editingIndex] = { ...formData };
      delete updatedData[formData.editingIndex].editingIndex;
      setTableData(updatedData);

    } else {
      // Add new row


      if (formData.field != "") {

        // setTableData([...tableData, { ...formData }]);

        const TileDataforDropdown = await getConfigActive(props.SiteURL, props.spHttpClient);
        const TileDataValueforDropdown = TileDataforDropdown.value;
        const selectedOption: any = TileDataValueforDropdown.find((element: any) => element.ID === formData.field);
        console.log(selectedOption);

        const isDuplicate = tableData.find((element: any) => element.field === formData.field);

        // setTableData((previewData: any) => ([...previewData, ...selectedOption, ...formData]))




        console.log(isDuplicate);

        if (isDuplicate == undefined) {

          setTableData((prevData: any[]) => [
            ...prevData,
            { ...formData, ...selectedOption },
          ]);
        }

        else {
          alert('duplicate');
        }
      }
      else {
        alert("Please Select");
      }
    }

    // Reset form
    setFormData({
      field: '',
      IsRequired: false,
      IsActiveControl: false,
      IsFieldAllowInFile: false,
      isShowAsFilter: false,
      Flag: "New",
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

  const handleTileStatusToggleChange = (checked: boolean): void => {
    setIsTileStatus(checked);
  };
  const handleAllowApproverToggleChange = (checked: boolean): void => {
    setIsAllowApprover(checked);
  };
  const handleToggleChange = (checked: boolean): void => {
    setIsDropdownVisible(checked);
  };

  const ToggleChangeforrefernceno = (checked: boolean): void => {
    setDynamicDataReference(checked);

    if (checked) {
      setRefExample(refExample);
    }
    else {
      setRefExample(RefrenceNOData);
    }
  };
  const ToggleChangeforArchiveAllowed = (checked: boolean): void => {
    setArchiveAllowed(checked);

    if (checked) {
      let ArchiveTestData = "Archive";
      let NewArchiveName = ArchiveTestData + " " + TileName;
      setArchiveTest(NewArchiveName);
    }
    else {
      let NewArchiveName = " ";
      setArchiveTest(NewArchiveName);
    }



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







  const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { width: 250 },
  };



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



  const TileLibrary = async (Internal: any, TileLID: any, ArchiveInternal: any) => {
    const Columns: any = [{
      ListName: Internal,
      ListType: "101",
      Columns: [
        { ColName: "DefineRole", ColType: 8 },
        { ColName: "ProjectmanagerAllow", ColType: 8 },
        { ColName: "Projectmanager", ColType: 20 },
        { ColName: "ProjectmanagerEmail", ColType: 2 },
        { ColName: "PublisherAllow", ColType: 8 },
        { ColName: "Publisher", ColType: 20 },
        { ColName: "PublisherEmail", ColType: 2 },
        { ColName: "CurrentApprover", ColType: 2 },
        {
          ColName: "Status",
          ColType: 7,
          LookupField: "StatusName",
          LookupList: "DMS_Mas_Status",
        },
        { ColName: "InternalStatus", ColType: 2 },
        { ColName: "ProjectMasterLID", ColType: 2 },
        { ColName: "LatestRemark", ColType: 3 },
        { ColName: "AllowApprover", ColType: 8 },
        { ColName: "Active", ColType: 8 },
        { ColName: "DisplayStatus", ColType: 2 },
        { ColName: "ReferenceNo", ColType: 2 },
        { ColName: "RefSequence", ColType: 9 },
        { ColName: "Level", ColType: 2 },
        { ColName: "Revision", ColType: 2 },
        { ColName: "DocStatus", ColType: 2 },
        { ColName: "Template", ColType: 2 },
        { ColName: "CreateFolder", ColType: 8 },
        { ColName: "Company", ColType: 2 },
        { ColName: "ActualName", ColType: 2 },
        { ColName: "DocumentSuffix", ColType: 2 },
        { ColName: "OtherSuffix", ColType: 2 },
        { ColName: "PSType", ColType: 2 },
        { ColName: "IsArchiveFlag", ColType: 8 },
        { ColName: "IsExistingRefID", ColType: 9 },
        { ColName: "IsExistingFlag", ColType: 2 },
        { ColName: "OCRText", ColType: 3 },
        { ColName: "DeleteFlag", ColType: 2 },
        { ColName: "OCRStatus", ColType: 2 },
        { ColName: "UploadFlag", ColType: 2, DefaultValue: "Backend" },
        { ColName: "NewFolderAccess", ColType: 2 },
      ],
    }]

    if (tableData.length > 0) {
      tableData.map(function (el) {
        let colType = getColumnType(el.ColumnType);
        Columns[0].Columns.push({ "ColName": el.InternalTitleName, "ColType": colType });
      })
    }

    if (IsArchiveAllowed == true) {
      const obj = {
        ListName: ArchiveInternal,
        ListType: "101",
        Columns: Columns[0].Columns

      }
      Columns.push(obj);
    }

    _spService.CreateList(props.context, props.SiteURL, Columns, TileLID, false)

  };



  const getColumnType = (val: any) => {
    switch (val) {
      case 'Multiple lines of Text':
        return 3
        break;

      case 'Date and Time':
        return 4
        break;

      case 'Choice':
        return 6
        break;

      case 'Lookup':
        return 7
        break;

      case 'Yes/No':
        return 8
        break;

      case 'Number':
        return 9
        break;

      case 'Person or Group':
        return 20
        break;

      default:
        return 2
    }
  }






  const clearField = () => {

    setTileName("");
    setSelectedFile(null);
    setAssignName("");
    setTileAdminName("");
    setorder0DataDataID("");
    setIsTileStatus(false);
    setIsAllowApprover(false);
    setIsDropdownVisible(false);
    setDynamicDataReference(false);
    setRefrenceNOData("");
    setArchiveVersions("");
    setArchiveTest("");
    setRedundancyDataID("");
    setArchiveAllowed(false);
    setSelectedcheckboxActions([]);
    setTableData([]);
    clearError();

  };
  const clearError = () => {

    setTileErr("");
    setAttachmentErr("");
    setAccessTileUserErr("");
    setTileAdminUserErr("");
    setTileSelectorderErr("");
    setTileReferenceNoErr("");
    setTileRedundancyDaysErr("");
    setTileArchiveVersionErr("");
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
    if (selectedFile === null) {
      setAttachmentErr("Enter Tile ImageURL");
      isValidForm = false;
    }

    if (assignID.length === 0) {
      setAccessTileUserErr("Please Enter Access Details");
      isValidForm = false;
    }

    if (TileAdminID.length === 0) {
      setTileAdminUserErr("Please add Tile Admin");
      isValidForm = false;
    }

    if (isDropdownVisible == true) {
      if (order0DataDataID === "" || order0DataDataID === undefined || order0DataDataID === null) {
        setTileSelectorderErr("Enter Order");
        isValidForm = false;
      }
    }

    if (DynamicDataReference == true) {
      if (refExample === "" || refExample === undefined || refExample === null) {
        setTileReferenceNoErr("Select Reference No");
        isValidForm = false;
      }
    }

    if (IsArchiveAllowed == true) {
      if (RedundancyDataID === "" || RedundancyDataID === undefined || RedundancyDataID === null) {
        setTileRedundancyDaysErr("Select Redundancy Days");
        isValidForm = false;
      }
      if (ArchiveVersions === "" || ArchiveVersions === undefined || ArchiveVersions === null) {
        setTileArchiveVersionErr("Enter Archive Version");
        isValidForm = false;
      }
    }
    //const maindata = await getTileAllData(props.SiteURL, props.spHttpClient);

    //   if(Action=="Add"){
    //     if(TileName != "" || TileName != undefined || TileName != null){



    //         for(var i=0; i<maindata.value; i++)
    //         { 
    //             if(maindata[i].TileName.toLowerCase() == maindata.toLowerCase())
    //             {
    //               setDuplicateTileError("<label class='error'>Tile Name you entered is already exists</label>");

    //             }
    //             else if($scope.GetData[i].LibraryName.toLowerCase() == Internal.toLowerCase())
    //             {
    //                     $("#txtTile").parent().append("<label class='error'>Tile Name you entered is already exists</label>");
    //                     $("#txtTile").focus();
    //                     $("#txtTile").prop("disabled",false);
    //                     rv = false;
    //                     return false;

    //             }
    //         }
    //     }

    // }
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

    let ArchiveInternal = "";
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

    let str = TileName;
    let Internal = str.replace(/[^a-zA-Z0-9]/g, '');

    if (IsArchiveAllowed == true) {
      let str1 = ArchiveTest;
      ArchiveInternal = str1.replace(/[^a-zA-Z0-9]/g, '');
    }
    else {
      ArchiveInternal = "";
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
      AllowOrder: isDropdownVisible,
      Documentpath: siteurl,
      ReferenceFormula: refExample,
      Separator: separator,
      DynamicControl: JSON.stringify(tableData),
      IsArchiveRequired: IsArchiveAllowed,
      ArchiveLibraryName: ArchiveInternal,
      RetentionDays: parseInt(RedundancyDataText),
      ArchiveVersionCount: parseInt(ArchiveVersions),
      LibraryName: Internal

    }
    let LID = await SaveTileSetting(props.SiteURL, props.spHttpClient, option);
    { showPopup }
    console.log(LID);
    let MainTileID = LID.Id;
    let MainTileLID = LID.Id.toString();



    if (LID != null) {
      saveAttachment(MainTileID);

      const TileLibraryData = TileLibrary(Internal, MainTileLID, ArchiveInternal).then(function (response) {
        console.log(TileLibraryData);
      });

    }
    clearField();
    closePanel();

  };



  const UpdateTileData = () => {
    clearError();
    let valid = validation();
    valid ? UpdateData() : "";
  };

  const UpdateSequenceNumber = async (startIndex: any, changeIndex: any, data: any, flag: string) => {
    const NewSequencedata = []
    for (let p = 0; p < data.length; p++) {

      const NextSequencedata = data.filter((item: any) => item.Order0 === startIndex);
      if (NextSequencedata.length > 0) {
        let obj = { Id: NextSequencedata[0].Id, Order0: changeIndex }
        NewSequencedata.push(obj)
        startIndex = startIndex + 1
        changeIndex = changeIndex + 1
      }
      if (startIndex > data.length) {
        startIndex = 1
      }
      if (changeIndex > data.length) {
        changeIndex = 1
      }
    }
    return NewSequencedata
  }

  const UpdateTileSequence = async (NewSequencedata: any) => {
    for (let i = 0; i < NewSequencedata.length; i++) {
      let obj = { Order0: NewSequencedata[i].Order0 }
      await UpdateTileSetting(props.SiteURL, props.spHttpClient, obj, CurrentEditID);
    }
  }

  let allLibColumn: any = [];
  const getAllColumns = async (TileName: any) => {
    var query = props.SiteURL + "/_api/web/lists/getbytitle('" + TileName + "')/Fields?$filter=(CanBeDeleted eq true)";
    const response = await GetListData(props.context, query);
    allLibColumn = response.d.results;

    console.log(allLibColumn);
  }

  const createAndUpdateColumn = async (Internal: string) => {
    for (var i = 0; i < tableData.length; i++) {
      const isDuplicate = allLibColumn.filter((item: any) => item.InternalName === tableData[i].InternalTitleName);
      if (isDuplicate.length == 0) {
        var colType = getColumnType(tableData[i].ColumnType);
        var NewColType = colType.toString();
        createColumn(props.context, props.SiteURL, Internal, tableData[i].InternalTitleName, NewColType).then(function (response) {

        });

      }
    }
  }



  const createAndUpdateArchiveColumn = async (TileValue: any, ArchiveValue: boolean) => {
    for (var i = 0; i < tableData.length; i++) {
      const isDuplicate = allLibColumn.filter((item: any) => item.InternalName === tableData[i].InternalTitleName);
      if (ArchiveValue == true) {
        if (isDuplicate.length == 0) {
          var colType = getColumnType(tableData[i].ColumnType);
          var NewColType = colType.toString();
          //_spService.CreateList(props.context, props.SiteURL, Columns, TileLID, false)
          createColumn(props.context, props.SiteURL, TileValue.ArchiveLibraryName, tableData[i].InternalTitleName, NewColType).then(function (response) {

          });
        }
      }

    }
  }

  const createColumn = async (context: WebPartContext, webURL: string, listName: string, ColumnName: string, fieldType: string) => {
    const url = webURL + "/_api/web/lists/GetByTitle('" + listName + "')/Fields";
    const spHttpClientOptions: ISPHttpClientOptions = {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=nometadata',
        'odata-version': ''
      },
      "body": JSON.stringify({
        'FieldTypeKind': fieldType,
        'Title': ColumnName
      })
    };

    return await context.spHttpClient.post(url, SPHttpClient.configurations.v1, spHttpClientOptions);
  }


  const UpdateData = async () => {

    let ArchiveInternal = "";
    let uniqueid = await uuidv4();

    console.log(uniqueid);

    let siteurl = "";
    let NewSequencedata: any = [];


    let GetAllTheTileData: any = await getTileAllData(props.SiteURL, props.spHttpClient);
    let GetAllTheTileDatavalueData = GetAllTheTileData.value;
    const Sequencedata = GetAllTheTileDatavalueData.filter((item: any) => item.Id === CurrentEditID);
    let flagData = "";

    var TileSequence = parseInt(order0DataDataID)
    if (Sequencedata[0].Order0 != TileSequence) {
      if (Sequencedata[0].Order0 > TileSequence) {
        flagData = "forward";
      }
      else {
        flagData = "backward";
      }
      NewSequencedata = await UpdateSequenceNumber(Sequencedata[0].Order0, TileSequence, GetAllTheTileDatavalueData, flagData);
      console.log(NewSequencedata);
    }

    if (selectedFile) {
      const backImageActualName = selectedFile.name.split(".")[0].replace(/[^a-zA-Z0-9]/g, "");
      const backImageName = `${backImageActualName}.${selectedFile.name.split(".")[1]}`;
      siteurl = `${props.SiteURL}/DMS_TileDocument/${uniqueid}-${backImageName}`;
      console.log(siteurl);
    } else {
      console.log("No file selected.");
    }

    let str = TileName;
    let Internal = str.replace(/[^a-zA-Z0-9]/g, '');

    if (IsArchiveAllowed == true) {
      let str1 = ArchiveTest;
      ArchiveInternal = str1.replace(/[^a-zA-Z0-9]/g, '');
    }
    else {
      ArchiveInternal = "";
    }


    createAndUpdateColumn(Internal);

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


    let option = {
      __metadata: { type: "SP.Data.DMS_x005f_Mas_x005f_TileListItem" },
      TileName: TileName,
      PermissionId: { results: userIds },
      TileAdminId: TilesIds[0],
      AllowApprover: isAllowApprover,
      Active: isTileStatus,
      IsDynamicReference: DynamicDataReference,
      ShowMoreActions: selectedcheckboxActions.join(";"),
      // Order0: orderData,
      AllowOrder: isDropdownVisible,
      SystemCreated: false,
      Documentpath: siteurl,
      ReferenceFormula: refExample,
      Separator: separator,
      DynamicControl: JSON.stringify(tableData),
      IsArchiveRequired: IsArchiveAllowed,
      //LibraryName: Internal

    }
    await UpdateTileSetting(props.SiteURL, props.spHttpClient, option, CurrentEditID);
    let UpdateData = await getDataById(props.SiteURL, props.spHttpClient, CurrentEditID);
    { showPopup }
    console.log(UpdateData);
    let UpdateTileID = UpdateData.value;
    console.log(UpdateTileID);
    if (UpdateTileID != null) {
      if (Sequencedata[0].Order0 != TileSequence) {
        if (NewSequencedata.length > 0) {
          await UpdateTileSequence(NewSequencedata)
        }
      }

      if (UpdateTileID[0].IsArchiveRequired == true) {

        var items = {
          __metadata: { type: "SP.Data.DMS_x005f_Mas_x005f_TileListItem" },
          ArchiveLibraryName: ArchiveInternal,
          RetentionDays: parseInt(RedundancyDataText),
          ArchiveVersionCount: parseInt(ArchiveVersions),
        }
        await UpdateTileSetting(props.SiteURL, props.spHttpClient, items, CurrentEditID);

        let ArchUpdateData = await getDataById(props.SiteURL, props.spHttpClient, CurrentEditID);

        let ArchUpdateTileID = ArchUpdateData.value;

        if (ArchUpdateTileID[0].ArchiveLibraryName == null && ArchUpdateTileID[0].ArchiveLibraryName == undefined) {
          const TileLibraryData = TileLibrary(Internal, CurrentEditID, ArchiveInternal).then(function (response) {
            console.log(TileLibraryData);
          });
        }
        else {
          createAndUpdateArchiveColumn(UpdateTileID[0], true);
        }

      }

    }
    alert("Data Updated SuccessFully");
    clearField();
    closePanel();

  };



  return (

    <div>
      <div>

        <div className={styles.alignbutton} >
          <DefaultButton id="requestButton" className={styles.submit} text={DisplayLabel?.Add} onClick={openAddPanel}  ></DefaultButton>
        </div>

        <Stack horizontal styles={stackStyles} tokens={stackTokens}>
          <Stack.Item grow={2} styles={stackItemStyles}>
            <ReactTableComponent
              TableClassName={styles.ReactTables}
              Tablecolumns={Tablecolumns}
              Tabledata={MainTableSetdata}
              PagedefaultSize={10}
              TableRows={1}
              TableshowPagination={MainTableSetdata.length > 10}
              TableshowFilter={true}
            />
          </Stack.Item>
        </Stack>



        <Panel
          headerText=""
          isOpen={isPanelOpen}
          onDismiss={closePanel}
          // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
          closeButtonAriaLabel="Close"
          type={PanelType.large}
          isFooterAtBottom={true}
        //headerText={isEditMode ? "Edit Item" : "Add New Item"}
        >

          {!isEditMode ? (
            <h6 className={styles.Headerlabel}>{DisplayLabel?.AddTileManagement}</h6>
          ) :
            <h6 className={styles.Headerlabel}>{DisplayLabel?.EditTileManagement}</h6>
          }
          <hr />


          <Accordion alwaysOpen >
            <Accordion.Item eventKey="0">
              <Accordion.Header className={styles.Accodordianherder}>{DisplayLabel?.TileDetails}</Accordion.Header>
              <Accordion.Body>
                <Form>
                  <div className={`ms-Grid ${styles.inlineFormContainer}`}>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>{DisplayLabel?.TileName}<span style={{ color: "red" }}>*</span></label>

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
                        <label className={styles.Headerlabel}>{DisplayLabel?.DisplayPicture}<span style={{ color: "red" }}>*</span></label>
                        <TextField
                          placeholder=" "
                          // errorMessage={"Please fill this field"}
                          //value={selectedFile}
                          onChange={handleFileChange}
                          //onChange={(el: React.ChangeEvent<HTMLInputElement>) => setSelectedFile()}
                          type="file"
                          errorMessage={attachmentErr}

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
                        <label className={styles.Headerlabel}>{DisplayLabel?.AccessToTile}<span style={{ color: "red" }}>*</span></label>
                        <PeoplePicker
                          context={peoplePickerContext}
                          personSelectionLimit={5}
                          showtooltip={true}
                          required={true}
                          errorMessage={AccessTileUserErr}
                          // searchTextLimit={2}
                          onChange={onPeoplePickerChange}
                          showHiddenInUI={false}
                          principalTypes={[PrincipalType.User]}
                          defaultSelectedUsers={assignID}
                        // resolveDelay={1000} 
                        />

                      </div>
                    </div>

                  </div>
                  <br /><br />
                  <div className={`ms-Grid ${styles.inlineFormContainer2}`}>
                    <div className="col-md-2">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>{DisplayLabel?.TileStatus}</label>
                        <Toggle checked={isTileStatus} onChange={(_, checked) => handleTileStatusToggleChange(checked!)} />
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>{DisplayLabel?.AllowApprover}</label>
                        <Toggle checked={isAllowApprover} onChange={(_, checked) => handleAllowApproverToggleChange(checked!)} />
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>{DisplayLabel?.Order}</label>
                        <Toggle checked={isDropdownVisible} onChange={(_, checked) => handleToggleChange(checked!)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label className={styles.Headerlabel}>{DisplayLabel?.TileAdmin1}<span style={{ color: "red" }}>*</span></label>
                        <PeoplePicker
                          context={peoplePickerContext}
                          showtooltip={true}
                          required={true}
                          errorMessage={TileAdminUserErr}
                          onChange={onTilePeoplePickerChange}
                          showHiddenInUI={false}
                          principalTypes={[PrincipalType.User]}
                          defaultSelectedUsers={TileAdminID}
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
                          <><label className={styles.Headerlabel}>{DisplayLabel?.Selectorder}<span style={{ color: "red" }}>*</span></label><Dropdown
                            placeholder="Select an option"
                            options={order0Data}
                            onChange={handleorder0DataDropdownChange}
                            selectedKey={order0DataDataID}
                            errorMessage={TileSelectorderErr}
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
              <Accordion.Header className={styles.Accodordianherder}>{DisplayLabel?.Fields}</Accordion.Header>
              <Accordion.Body>

                <form>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>{DisplayLabel?.SelectMoreActions}</label>
                    <div
                      style={{
                        display: 'flex',
                        gap: '15px',
                        alignItems: 'center',
                        /*backgroundColor: '#f5f8fa',*/
                        color: '#5e6278',
                        padding: '10px',
                        /*border: '1px solid #f5f8fa',*/
                      }}
                    >
                      {actions.map((action) => (
                        <Checkbox
                          label={action}
                          key={action}
                          onChange={(e, isChecked) => handleCheckboxChange(action, isChecked)}
                          checked={selectedcheckboxActions.includes(action)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th>{DisplayLabel?.SrNo}</th>
                          <th>{DisplayLabel?.Field} <span style={{ color: "red" }}>*</span></th>
                          <th>{DisplayLabel?.IsRequired}</th>
                          <th>{DisplayLabel?.FieldStatus}</th>
                          <th>{DisplayLabel?.IsFieldAllowinFile}</th>
                          <th>{DisplayLabel?.SearchFilterRequired}</th>
                          <th>{DisplayLabel?.Action}</th>
                        </tr>
                      </thead>

                      <tr style={{ borderBottom: '1px solid #ddd' }}>
                        <th style={{ padding: '10px' }}></th>
                        <th style={{ padding: '10px' }}>

                          <Dropdown
                            placeholder="Choose One"
                            options={configData}
                            selectedKey={formData.field}
                            onChange={handleInputChange1}
                          />
                        </th>
                        <th style={{ padding: '10px' }}>
                          <Toggle checked={formData.IsRequired} onChange={(e, checked) => handleInputChange('IsRequired', checked)} />
                        </th>
                        <th style={{ padding: '10px' }}>
                          <Toggle checked={formData.IsActiveControl} onChange={(e, checked) => handleInputChange('IsActiveControl', checked)} />
                        </th>
                        <th style={{ padding: '10px' }}>
                          <Toggle checked={formData.IsFieldAllowInFile} onChange={(e, checked) => handleInputChange('IsFieldAllowInFile', checked)} />
                        </th>
                        <th style={{ padding: '10px' }}>
                          <Toggle checked={formData.isShowAsFilter} onChange={(e, checked) => handleInputChange('isShowAsFilter', checked)} disabled={isToggleDisabled} />
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
                                  IsRequired: false,
                                  IsActiveControl: false,
                                  IsFieldAllowInFile: false,
                                  isShowAsFilter: false,
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
                            <td>{row.Title}</td>
                            <td>{row.IsRequired ? 'Yes' : 'No'}</td>
                            <td>{row.IsActiveControl ? 'Yes' : 'No'}</td>
                            <td>{row.IsFieldAllowInFile ? 'Yes' : 'No'}</td>
                            <td>{row.isShowAsFilter ? 'Yes' : 'No'}</td>
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
                              {row.Flag && (
                                <IconButton
                                  iconProps={deleteIcon}
                                  title="Delete"
                                  ariaLabel="Delete"
                                  onClick={() => handleDelete(index)}
                                  style={{ color: 'red', font: 'bold', cursor: 'pointer' }}
                                />
                              )}
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
              <Accordion.Header className={styles.Accodordianherder}>{DisplayLabel?.ReferenceNoDetails}</Accordion.Header>
              <Accordion.Body>
                <Form>

                  <div style={{ marginBottom: '20px' }}>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {/* Dynamic Reference Toggle */}
                      <div className="col-md-3">
                        <label className={styles.Headerlabel}>{DisplayLabel?.IsDynamicReference}<span style={{ color: "red" }}>*</span></label>
                        <Toggle
                          checked={DynamicDataReference}
                          onChange={(_, checked) => ToggleChangeforrefernceno(checked!)}
                        />
                      </div>

                      {/* Dynamic Reference Example TextField */}
                      {!DynamicDataReference && (
                        <div className="col-md-6">
                          <label className={styles.Headerlabel}>{DisplayLabel?.DefaultReferenceExample}</label>
                          <TextField
                            placeholder=" "
                            value={RefrenceNOData}
                            disabled
                          />
                        </div>
                      )}

                      {DynamicDataReference && (
                        <div className="col-md-6">
                          <label className={styles.Headerlabel}>{DisplayLabel?.DynamicReferenceExample}</label>
                          <TextField
                            placeholder=" "
                            value={refExample}
                            errorMessage={TileReferenceNoErr}
                            disabled
                          />
                        </div>
                      )}
                    </div>


                    {DynamicDataReference && (
                      <div style={{ marginBottom: '20px' }}>

                        <label className={styles.Headerlabel} style={{ marginBottom: '10px', display: 'block' }}>{DisplayLabel?.ChooseFields}</label>
                        <div
                          style={{
                            display: 'flex',
                            gap: '15px',
                            alignItems: 'center',
                            /* backgroundColor: '#f5f8fa',*/
                            color: '#5e6278',
                            padding: '10px',
                            /* border: '1px solid #f5f8fa',*/
                          }}
                        >

                          <Checkbox label="YYYY" checked={refFormatData.includes("YYYY")} onChange={(e, checked) => handleCheckboxToggle("YYYY", checked!)} />
                          <Checkbox label="YY_YY" checked={refFormatData.includes("YY_YY")} onChange={(e, checked) => handleCheckboxToggle("YY_YY", checked!)} />
                          <Checkbox label="MM" checked={refFormatData.includes("MM")} onChange={(e, checked) => handleCheckboxToggle("MM", checked!)} />
                          {
                            tableData.map((el) => (CheckboxData(el)))

                          }

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
                            <label className={styles.Headerlabel} style={{ display: 'block' }}>{DisplayLabel?.Separator}</label>
                            {/* <ChoiceGroup
                              options={choiceoptions}
                              onChange={(e, option) => handleRadioChange("separator", option?.key!)}
                              required={true}
                              selectedKey={separator}
                              //defaultSelectedKey="Hyphens ( - )"
                              styles={{
                                flexContainer: {
                                  display: 'flex',
                                  flexDirection: 'row', // Arrange radio buttons horizontally
                                  gap: '10px',
                                  backgroundColor: '#f5f8fa',
                                },
                              }}
                            /> */}

                            <ChoiceGroup
                              options={[
                                { key: "-", text: "Hyphens ( - )" },
                                { key: "/", text: "Slash ( / )" },
                              ]}
                              selectedKey={separator}
                              onChange={(e, option) => {
                                handleRadioChange("separator", option?.key!);
                                setSeparator(option?.key!);
                              }}
                              required={true}
                              styles={{
                                flexContainer: {
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: "10px",
                                  /* backgroundColor: "#f5f8fa",*/
                                },
                              }}
                            />
                          </div>

                          {/* Initial Increment Choice Group */}
                          <div
                            className="col-md-8"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              padding: '10px',
                              flex: 1,
                            }}
                          >
                            <label className={styles.Headerlabel} style={{ display: 'block' }}>{DisplayLabel?.InitialIncrement}</label>
                            {/* <ChoiceGroup
                              options={InitialIncrementoptions}
                              selectedKey={increment}
                              onChange={(e, option) => handleRadioChange("increment", option?.key!)}
                              required={true}
                              //defaultSelectedKey="Continue"
                              styles={{
                                flexContainer: {
                                  display: 'flex',
                                  flexDirection: 'row', // Arrange radio buttons horizontally
                                  gap: '10px',
                                  backgroundColor: '#f5f8fa',
                                },
                              }}
                            /> */}

                            <ChoiceGroup
                              options={[
                                { key: "Continue", text: "Continue" },
                                { key: "Monthly", text: "Monthly" },
                                { key: "Yearly", text: "Yearly" },
                                { key: "Financial Year", text: "Financial Year" },
                                { key: "Manual", text: "Manual" },
                              ]}
                              selectedKey={increment}
                              onChange={(e, option) => {
                                handleRadioChange("increment", option?.key!);
                                setIncrement(option?.key!);
                              }}
                              required={true}
                              styles={{
                                flexContainer: {
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: "10px",
                                  /*backgroundColor: "#f5f8fa",*/
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
                          <label className={styles.Headerlabel} style={{ display: 'block' }}>{DisplayLabel?.ChangeSetting}</label>

                          <div style={{ display: 'none' }}>
                            <TextField
                              label="Prefix"
                              value={prefix}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePrefixChange(e.target.value)}
                            />

                          </div>

                          <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
                            {refFormatData.map((item, index) => (
                              <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                <span>{item}</span>
                                <Dropdown
                                  options={[
                                    { key: "Separator", text: "Separator" },
                                    { key: "Concat", text: "Concat" },
                                  ]}
                                  onChange={(e, option) => handleDropdownChange(index, option?.key?.toString() || "Separator")}
                                  selectedKey={customSeparators[index] || "Separator"} // Default to Separator
                                />
                              </div>
                            ))}


                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                              <span>{increment}</span>
                            </div>
                          </div>




                        </div>
                      </div>
                    )}



                  </div>

                </Form>
              </Accordion.Body>
            </Accordion.Item>
            <br />
            <Accordion.Item eventKey="3">
              <Accordion.Header className={styles.Accodordianherder}>{DisplayLabel?.ArchiveSection}</Accordion.Header>
              <Accordion.Body>
                <Form>
                  <div style={{ marginBottom: '20px' }}>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {/* Dynamic Reference Toggle */}
                      <div className="col-md-3">
                        <label className={styles.Headerlabel}>{DisplayLabel?.IsArchiveAllowed}<span style={{ color: "red" }}>*</span></label>
                        <Toggle
                          checked={IsArchiveAllowed}
                          onChange={(_, checked) => ToggleChangeforArchiveAllowed(checked!)}
                        />
                      </div>

                      {IsArchiveAllowed && (
                        <div className="col-md-6">
                          <label className={styles.Headerlabel}>{DisplayLabel?.ArchiveDocumentLibraryName}</label>
                          <TextField
                            placeholder=" "
                            value={ArchiveTest}
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
                          <div className="col-md-3"
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
                            <label className={styles.Headerlabel} style={{ display: 'block' }}>{DisplayLabel?.SelectArchiveDays}</label>
                            <Dropdown
                              placeholder="Select an Option"
                              options={RedundancyData}
                              onChange={handleArchiveDropdownChange}
                              selectedKey={RedundancyDataID}
                              errorMessage={TileRedundancyDaysErr}

                            //selectedKey={}
                            />
                          </div>

                          {/* Initial Increment Choice Group */}
                          <div
                            className="col-md-6"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              padding: '10px',
                              flex: 1,
                            }}
                          >
                            <label className={styles.Headerlabel} style={{ display: 'block' }}>{DisplayLabel?.ArchiveVersions}</label>
                            <TextField
                              placeholder=" "
                              value={ArchiveVersions}
                              errorMessage={TileArchiveVersionErr}
                              onChange={(el: React.ChangeEvent<HTMLInputElement>) => setArchiveVersions(el.target.value)}
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

              {!isEditMode ? (
                <DefaultButton onClick={submitTileData} text={DisplayLabel?.Submit} className={styles['sub-btn']} />
              ) :
                <DefaultButton onClick={UpdateTileData} text={DisplayLabel?.Update} className={styles['sub-btn']} />
              }

              <MessageDialog isPopupBoxVisible={isPopupVisible} hidePopup={hidePopup} />


              <DefaultButton text={DisplayLabel?.Cancel} onClick={closePanel} className={styles['can-btn']} allowDisabledFocus />

            </div>

          </div>

        </Panel>

      </div>
    </div>
  )
}








