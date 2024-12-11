import * as React from "react";
import { useState, useEffect } from 'react';
import * as moment from "moment";
import styles from '../Master/Master.module.scss';
import { SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
//import { HTTPServices, _getListItem } from "../../../HTTPServices";
import {
  DefaultButton, Panel, PanelType, TextField, Toggle, Dropdown, IDropdownStyles, Checkbox, ChoiceGroup,
  IIconProps,
  IconButton,
  IDropdownOption
} from 'office-ui-fabric-react';
import { PeoplePicker, PrincipalType, IPeoplePickerContext } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import MessageDialog from '../ResuableComponents/PopupBox';
import ReactTableComponent from '../ResuableComponents/ReusableDataTable';
import { IStackItemStyles, IStackStyles, IStackTokens, Stack, FontIcon } from 'office-ui-fabric-react';
import { getTileAllData, SaveTileSetting, UpdateTileSetting } from "../../../../Services/MasTileService";
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
import { getActiveRedundancyDays } from "../../../../Services/ArchiveRedundancyDaysService";

//import { getConfigActive } from "../../../../Services/ConfigService";


//import {WebPartContext} from '@microsoft/sp-webpart-base'
//import type { IHomePageProps } from '../IHomePageProps';


export default function Master({ props }: any): JSX.Element {


  const [showModal, setShowModal] = useState(false);
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
  const [order0Data, setorder0Data] = useState([]);
  const [configData, setConfigData] = useState([]);
  const [RedundancyData, setRedundancyData] = useState([]);
  const [RedundancyDataID, setRedundancyDataID] = useState('');
  const [RedundancyDataText, setRedundancyDataText] = useState('');
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


  useEffect(() => {

    let DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}'); //localStorage.getItem('DisplayLabel')|| null;
    setDisplayLabel(DisplayLabel);
    clearField();
    //fetchData();
    getAllData();
    ConfigMasterData();
    GetMainListData();
    RedundancyDaysData();
    setRefrenceNOData(`${moment().format('YYYY')}-00001`);


  }, []);



  const CheckboxData = (obj: any) => {


    let icheckbox;
    if (obj.ColumnType == 'Dropdown' && !obj.IsStaticValue && obj.IsRequired == true && obj.IsFieldAllowInFile != true && obj.IsActiveControl == true) {
      icheckbox = <Checkbox label={obj.Title} onChange={(e, checked) => handleCheckboxToggle(obj.Title, checked!)} />


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
            { ...formData, ...selectedOption }, // Combine formData with selectedOption if necessary
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



  const TileLibrary = (Internal: any, TileLID: any) => {
    const Columns = [{
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
    // const listName = Columns;
    let Listguid: { Title: string; Id: string }[] = [];
    let count = 0;
    // let outoff = '0/' + Columns.length;

    setTimeout(function () {
      for (let i = 0; i < Columns.length; i++) {
        let listName = Columns[i].ListName;
        let template = Number(Columns[i].ListType);
        createList(listName, template).then(function (response) {
          let obj = { LibGuidName: response.Id }
          UpdateTileSetting(props.SiteURL, props.spHttpClient, obj, TileLID).then(function (response) { });
          Listguid.push(response);
          count++;
          if (count == Columns.length) {
            let listCount = 0;
            for (let list = 0; list < Columns.length; list++) {
              listCount++;
              //let columnCount = 0;
              let Count = 0;
              let ColumnsObj: any = Columns[list].Columns;
              for (let col = 0; col < ColumnsObj.length; col++) {
                // columnCount++;
                if (ColumnsObj[col].ColType == 6) {
                  let returnedData = Listguid.filter(function (element, index) {
                    return element.Title == Columns[list].ListName;
                  });
                  let obj = {
                    '__metadata': { 'type': 'SP.FieldChoice' },
                    'FieldTypeKind': 6,
                    'Title': ColumnsObj[col].ColName,
                    'Choices': { '__metadata': { 'type': 'Collection(Edm.String)' }, 'results': ColumnsObj[col].Choices }
                  } //, 'EditFormat': 1 
                  CreateChoiceCloumn(returnedData[0].Id, obj).then(function (response) {
                    Count++;
                    if (Count == ColumnsObj.length && listCount == Columns.length) {
                      DefaultView(Columns);
                    }
                    //deferred.resolve(response);
                  });
                } else if (ColumnsObj[col].ColType == 7) {
                  let listID = Listguid.filter(function (element, index) {
                    return element.Title == Columns[list].ListName;
                  });
                  let query = props.SiteURL + "/_api/web/lists/getByTitle('" + ColumnsObj[col].LookupList + "')/Id";
                  GetListData(query).then(function (response) {
                    let listGuID = response.d.Id;
                    let obj = {
                      'parameters': {
                        '__metadata': { 'type': 'SP.FieldCreationInformation' },
                        'FieldTypeKind': 7,
                        'Title': ColumnsObj[col].ColName,
                        'LookupListId': listGuID,
                        'LookupFieldName': ColumnsObj[col].LookupField
                      }
                    }
                    Createlookup(listID[0].Id, obj).then(function (response) {
                      Count++;
                      if (Count == ColumnsObj.length && listCount == Columns.length) {
                        DefaultView(Columns);
                      }
                      // deferred.resolve(response);
                    });
                  })
                } else {
                  createColumn(Columns[list].ListName, ColumnsObj[col].ColName, ColumnsObj[col].ColType).then(function (response) {
                    Count++
                    if (Count == ColumnsObj.length && listCount == Columns.length) {
                      DefaultView(Columns);
                    }
                  });
                }
              }
            }
          }
        })
      }
    }, 5000);
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
  const createList = async (listName: string, Template: number) => {
    let siteUrl = props.SiteURL + "/_api/web/lists";


    const listDefinition: any = {
      "Title": listName,
      "AllowContentTypes": true,
      "BaseTemplate": Template,
      "ContentTypesEnabled": true,
    };
    const spHttpClientOptions: ISPHttpClientOptions = {
      "body": JSON.stringify(listDefinition)
    };
    return await props.context.spHttpClient.post(siteUrl, SPHttpClient.configurations.v1, spHttpClientOptions)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  const GetListData = async (query: string) => {
    const response = await props.spHttpClient.get(query, SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=verbose',
        'odata-version': '',
      },
    });
    return await response.json();
  };

  const CreateChoiceCloumn = async (listID: string, obj: any) => {
    debugger;
    const url = props.SiteURL + "/_api/web/lists(guid'" + listID + "')/Fields";
    const spHttpClientOptions: ISPHttpClientOptions = {
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Content-type': 'application/json;odata=verbose',
        'odata-version': ''
      },
      "body": JSON.stringify(obj)
    };
    return await props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, spHttpClientOptions)
  }

  const Createlookup = async (listID: string, obj: any) => {
    const url = props.SiteURL + "/_api/web/lists(guid'" + listID + "')/fields/addfield";
    const spHttpClientOptions: ISPHttpClientOptions = {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=nometadata',
        'odata-version': ''
      },
      "body": JSON.stringify(obj)
    };
    return await props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, spHttpClientOptions)
  }

  const createColumn = async (listName: string, ColumnName: string, ColumnType: number) => {
    const url = props.SiteURL + "/_api/web/lists/GetByTitle('" + listName + "')/Fields";
    const spHttpClientOptions: ISPHttpClientOptions = {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=nometadata',
        'odata-version': ''
      },
      "body": JSON.stringify({
        __metadata: { type: 'SP.Field' },
        'FieldTypeKind': ColumnType,
        'Title': ColumnName,
      })
    };

    return await props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, spHttpClientOptions);
  }

  const DefaultView = async (IListItem: { ListName: string; ListType: string; Columns: { ColName: string; ColType: number }[] }[]) => {
    console.log(IListItem);
    //for (let list = 0; list < IListItem.length; list++) {
    const url = props.SiteURL + "/_api/Web/Lists/getByTitle('" + IListItem[0]["ListName"] + "')/DefaultView";
    await props.spHttpClient.get(url, SPHttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json;odata=verbose',
        'odata-version': '',
      },
    }).then((response: SPHttpClientResponse) => {
      response.json().then((result: any) => {
        const defaulttViewID = result["d"]["Id"];

        console.log(defaulttViewID);
        addColumnOnView(IListItem, defaulttViewID)

      })
    });
    //}
  };


  const addColumnOnView = async (IListItem: any, defaultView: string) => {
    let listCount = 0;
    for (let listName = 0; listName < IListItem.length; listName++) {
      listCount++;
      let columnCount = 0;
      // let Count = 0;
      let ColumnsObj: any = IListItem[listName]["Columns"];
      for (let colName = 0; colName < ColumnsObj.length; colName++) {
        // Count++;
        let obj = { 'strField': ColumnsObj[colName]["ColName"] }
        var resURL = props.SiteURL + "/_api/web/lists/getbytitle('" + IListItem[listName]["ListName"] + "')/Views/getbyId('" + defaultView + "')/ViewFields/AddViewField";
        debugger;
        await addDefaultViewColumn(resURL, obj).then((r: any) => {
          columnCount++;
          if (columnCount == ColumnsObj.length && listCount == IListItem.length) {
            alert("Added");
          }
        })
      }
    }
  }

  const addDefaultViewColumn = async (resURL: string, obj: any) => {
    return await props.context.spHttpClient.post(resURL, SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json;odata=nometadata',
          'Content-type': 'application/json;odata=nometadata',
          'odata-version': '',
        },
        body: JSON.stringify(obj)
      })
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

    let str = TileName;
    let Internal = str.replace(/[^a-zA-Z0-9]/g, '');

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
      Documentpath: siteurl,
      ReferenceFormula: refExample,
      Separator: separator,
      DynamicControl: JSON.stringify(tableData),
      IsArchiveRequired: IsArchiveAllowed,
      ArchiveLibraryName: ArchiveTest,
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

      const TileLibraryData = TileLibrary(Internal, MainTileLID);

      console.log(TileLibraryData);

    }


  };



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
                            options={order0Data}
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
                            value={RefrenceNOData}
                            disabled
                          />
                        </div>
                      )}

                      {DynamicDataReference && (
                        <div className="col-md-6">
                          <label className={styles.Headerlabel}>Dynamic Reference Example</label>
                          <TextField
                            placeholder=" "
                            value={refExample}
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
                            /* backgroundColor: '#f5f8fa',*/
                            color: '#5e6278',
                            padding: '10px',
                            /* border: '1px solid #f5f8fa',*/
                          }}
                        >

                          <Checkbox label="YYYY" onChange={(e, checked) => handleCheckboxToggle("YYYY", checked!)} />
                          <Checkbox label="YY_YY" onChange={(e, checked) => handleCheckboxToggle("YY_YY", checked!)} />
                          <Checkbox label="MM" onChange={(e, checked) => handleCheckboxToggle("MM", checked!)} />
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
                            <label className={styles.Headerlabel} style={{ display: 'block' }}>Separator</label>
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
                            <label className={styles.Headerlabel} style={{ display: 'block' }}>Initial Increment</label>
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
                          <label className={styles.Headerlabel} style={{ display: 'block' }}>Change Setting</label>

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
                            <label className={styles.Headerlabel} style={{ display: 'block' }}>Select Archive Days</label>
                            <Dropdown
                              placeholder="Select an Option"
                              options={RedundancyData}
                              onChange={handleArchiveDropdownChange}
                              selectedKey={RedundancyDataID}

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
                            <label className={styles.Headerlabel} style={{ display: 'block' }}>Archive Versions</label>
                            <TextField
                              placeholder=" "
                              value={ArchiveVersions}
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







