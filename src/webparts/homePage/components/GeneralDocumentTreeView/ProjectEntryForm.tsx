import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
    ChoiceGroup,
    DefaultButton,
    Panel,
    PanelType,
    PrimaryButton,
    TextField,
    Toggle,
    DatePicker, mergeStyleSets
} from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
    IPeoplePickerContext,
    PeoplePicker,
    PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import styles from "./TreeView.module.scss";
import { getActiveTypeData } from "../../../../Services/PrefixSuffixMasterService";
import { getConfigActive } from "../../../../Services/ConfigService";
import { getDataByLibraryName } from "../../../../Services/MasTileService";
import { getAllFolder, getListData, updateLibrary } from "../../../../Services/GeneralDocument";
import { FolderStructure } from "../../../../Services/FolderStructure";
import { getUserIdFromLoginName } from "../../../../DAL/Commonfile";
import PopupBox from "../ResuableComponents/PopupBox";
import cls from '../HomePage.module.scss';
import { ILabel } from "../Interface/ILabel";
import Select from 'react-select';
import { getTemplateActive } from "../../../../Services/TemplateService";
import { getActiveFolder } from "../../../../Services/FolderMasterService";
import moment from "moment";

export interface IProjectEntryProps {
    isOpen: boolean;
    dismissPanel: (value: boolean) => void;
    context: WebPartContext;
    LibraryDetails: any;
    admin: any;
    FormType: string;
    folderObject: any;
    folderPath: string;
}


const ProjectEntryForm: React.FC<IProjectEntryProps> = ({
    isOpen,
    dismissPanel,
    context,
    LibraryDetails,
    admin,
    FormType,
    folderObject,
    folderPath
}) => {
    const DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
    const [folderName, setFolderName] = useState<string>("");
    const [isSuffixRequired, setIsSuffixRequired] = useState<boolean>(false);
    const [SuffixData, setSuffixData] = useState<any[]>([]);
    const [Suffix, setSuffix] = useState<string>("");
    const [OtherSuffix, setOtherSuffix] = useState<string>("");
    const [configData, setConfigData] = useState<any[]>([]);
    const [dynamicControl, setDynamicControl] = useState<any[]>([]);
    const [libraryDetails, setLibraryDetails] = useState<any>({});
    const [options, setOptions] = useState<any>({});
    const [dynamicValues, setDynamicValues] = useState<{ [key: string]: any; }>({});
    const buttonStyles = { root: { marginRight: 8 } };
    const [folderAccess, setFolderAccess] = useState<any[]>([]);
    // const [allUsers, setAllUsers] = useState([]);
    const [usersIds, setUsersIds] = useState<any[]>([]);
    const [publisher, setPublisher] = useState<any[]>([]);
    const [approver, setApprover] = useState<any[]>([]);
    const [isPopupBoxVisible, setIsPopupBoxVisible] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [isApprovalRequired, setIsApprovalRequired] = useState<boolean>(false);
    const [allUsers, setAllUsers] = useState<any>([]);

    const [folderNameErr, setFolderNameErr] = useState<string>("");
    const [SuffixErr, setSuffixErr] = useState<string>("");
    const [OtherSuffixErr, setOtherSuffixErr] = useState<string>("");
    const [dynamicValuesErr, setDynamicValuesErr] = useState<{ [key: string]: string; }>({});
    const [folderAccessErr, setFolderAccessErr] = useState<string>("");
    const [publisherErr, setPublisherErr] = useState<string>("");
    const [approverErr, setApproverErr] = useState<string>("");
    const [showLoader, setShowLoader] = useState({ display: "none" });
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [projectManagerEmail, setProjectManagerEmail] = useState("");
    const [publisherEmail, setPublisherEmail] = useState("");
    const [panelTitle, setPanelTitle] = useState(DisplayLabel.EntryForm);
    const [createStructure, setCreateStructure] = useState<boolean>(false);
    const [allFolderTemplate, setAllFolderTemplate] = useState<any>([]);
    const [folderTemplate, setFolderTemplate] = useState<any>("");
    const [folderTemplateErr, setFolderTemplateErr] = useState<any>("");
    const [folderStructure, setFolderStructure] = useState<any>([]);
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null; }>({});
    const meargestyles = mergeStyleSets({
        root: { selectors: { '> *': { marginBottom: 15 } } },
        control: { maxWidth: "100%", marginBottom: 15 },
    });

    const handleInputChange = (fieldName: string, value: any) => {
        setDynamicValues((prevValues) => ({
            ...prevValues,
            [fieldName]: value,
        }));
    };

    const peoplePickerContext: IPeoplePickerContext = {
        absoluteUrl: context.pageContext.web.absoluteUrl,
        msGraphClientFactory: context.msGraphClientFactory,
        spHttpClient: context.spHttpClient
    };


    const handleToggleChange = (_: React.MouseEvent<HTMLElement>, checked?: boolean) => {
        setIsSuffixRequired(!!checked);
    };

    useEffect(() => {
        fetchLibraryDetails();
        fetchSuffixData();
        getAllUsers();
        getFolderStructure();
        getFolderTemplate();
    }, []);

    useEffect(() => {
        clearErr();
        clearFeilds();
        setIsDisabled(FormType === "ViewForm");
        FormType !== "EntryForm" ? bindFormData() : "";
        if (FormType === "ViewForm")
            setPanelTitle(DisplayLabel.ViewForm);
        else if (FormType === "EditForm")
            setPanelTitle(DisplayLabel.EditForm);
        else
            setPanelTitle(DisplayLabel.EntryForm);

    }, [isOpen]);

    const getFolderTemplate = async () => {
        const data = await getTemplateActive(context.pageContext.web.absoluteUrl, context.spHttpClient);
        if (data.value.length > 0)
            setAllFolderTemplate(data.value.map((el: any) => ({ value: el.Name, label: el.Name })));
    };

    const getFolderStructure = async () => {
        const data = await getActiveFolder(context.pageContext.web.absoluteUrl, context.spHttpClient);
        setFolderStructure(data.value);
    };

    const getAllUsers = async () => {
        const data = await getListData(`${context.pageContext.web.absoluteUrl}/_api/web/siteusers?$filter=PrincipalType eq 1`, context);
        if (data.value.length > 0) {
            setAllUsers(data.value);
        }
    };

    const fetchSuffixData = async () => {
        const data = await getActiveTypeData(
            context.pageContext.web.absoluteUrl,
            context.spHttpClient,
            "Suffix"
        );
        const column = data.value.map((item: any) => ({
            value: item.PSName,
            label: item.PSName,
        }));
        setSuffixData(column);
    };


    const fetchLibraryDetails = async () => {
        const dataConfig = await getConfigActive(context.pageContext.web.absoluteUrl, context.spHttpClient);
        const libraryData = await getDataByLibraryName(context.pageContext.web.absoluteUrl, context.spHttpClient, LibraryDetails.LibraryName);

        setLibraryDetails(libraryData.value[0]);
        setConfigData(dataConfig.value);

        if (libraryData.value[0]?.DynamicControl) {
            let jsonData = JSON.parse(libraryData.value[0].DynamicControl);
            jsonData = jsonData.filter((ele: any) => ele.IsActiveControl);
            jsonData = jsonData.map((el: any) => {
                if (el.ColumnType === "Person or Group") {
                    el.InternalTitleName = `${el.InternalTitleName}Id`;
                }
                return el;
            });
            setDynamicControl(jsonData);
            bindDropdown(jsonData);
        }
    };

    const bindDropdown = (dynamic: any) => {
        let dropdownOptions = [{ key: "", text: "" }];
        dynamic.map(async (item: any, index: number) => {
            if (item.ColumnType === "Dropdown" || item.ColumnType === "Multiple Select") {
                if (item.IsStaticValue) {
                    dropdownOptions = item.StaticDataObject.split(";").map((ele: string) => ({
                        value: ele,
                        label: ele,
                    }));
                } else {
                    const data = await getListData(
                        `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${item.InternalListName}')/items?$top=5000&$filter=Active eq 1&$orderby=${item.DisplayValue} asc`,
                        context
                    );
                    dropdownOptions = data.value.map((ele: any) => ({
                        value: ele[item.DisplayValue],
                        label: ele[item.DisplayValue],
                    }));
                }
                setOptions((prev: any) => ({ ...prev, [item.InternalTitleName]: dropdownOptions }));
            }
        });
    };

    const renderDynamicControls = useCallback(() => {
        return dynamicControl.filter((item: any, index: number) => !item.IsFieldAllowInFile).map((item: any, index: number) => {
            const filterObj = configData.find((ele) => ele.Id === item.Id);

            if (!filterObj) return null;

            switch (item.ColumnType) {
                case "Dropdown":
                case "Multiple Select":
                    return (
                        <div className="col-md-12" key={index}>
                            <label className={styles.Headerlabel}>{item.Title}{item.IsRequired ? <span style={{ color: "red" }}>*</span> : <></>}</label>
                            <Select
                                options={options[item.InternalTitleName]}
                                required={item.IsRequired}
                                value={(options[item.InternalTitleName] || []).find((option: any) => option.value === dynamicValues[item.InternalTitleName])}
                                onChange={(option: any) => handleInputChange(item.InternalTitleName, option?.value)}
                                isSearchable
                                placeholder={DisplayLabel?.Selectanoption}
                                isMulti={item.ColumnType === "Multiple Select"}
                                isDisabled={isDisabled}
                                ref={(input: any) => (inputRefs.current[item.InternalTitleName] = input)}
                            />
                            {dynamicValuesErr[item.InternalTitleName] && <p style={{ color: "rgb(164, 38, 44)" }}>{dynamicValuesErr[item.InternalTitleName]}</p>}
                        </div>
                    );

                case "Person or Group":
                    return (
                        // <div className={dynamicControl.length > 5 ? styles.col6 : styles.col12} key={index}>
                        <div className="col-md-12" key={index}>
                            <PeoplePicker
                                titleText={item.Title}
                                context={peoplePickerContext}
                                personSelectionLimit={20}
                                showtooltip={true}
                                required={item.IsRequired}
                                showHiddenInUI={false}
                                principalTypes={[PrincipalType.User]}
                                // onChange={(items) => handleInputChange(item.InternalTitleName, items)}
                                onChange={async (items) => {
                                    try {
                                        const userIds = await Promise.all(
                                            items.map(async (item: any) => {
                                                const data = await getUserIdFromLoginName(context, item.id);
                                                return data.Id;
                                            })
                                        );
                                        setDynamicValues((prevValues) => ({
                                            ...prevValues,
                                            [item.InternalTitleName]: userIds[0],
                                        }));
                                        setUsersIds((prev) => [...prev, ...userIds]);
                                    } catch (error) {
                                        console.error("Error fetching user IDs:", error);
                                    }
                                }}
                                defaultSelectedUsers={allUsers
                                    .filter((el: any) => el.Id === dynamicValues[item.InternalTitleName])
                                    .map((user: any) => user.Email)}
                                disabled={isDisabled}
                                errorMessage={dynamicValuesErr[item.InternalTitleName]}
                                ref={(input: any) => (inputRefs.current[item.InternalTitleName] = input)}
                            />
                        </div>
                    );

                case "Radio":
                    const radioOptions = filterObj.StaticDataObject.split(";").map((ele: string) => ({
                        key: ele,
                        text: ele,
                    }));
                    return (
                        // <div className={dynamicControl.length > 5 ? styles.col6 : styles.col12} key={index}>
                        <div className="col-md-12" key={index}>
                            <ChoiceGroup
                                options={radioOptions}
                                onChange={(ev, option) => handleInputChange(item.InternalTitleName, option?.key)}
                                selectedKey={dynamicValues[item.InternalTitleName] || ""}
                                label={item.Title}
                                required={item.IsRequired}
                                disabled={isDisabled}
                            />
                        </div>
                    );
                case "Date and Time":
                    return (
                        //<div className={dynamicControl.length > 5 ? styles.col6 : styles.col12} key={index}>
                        <div className="col-md-12" key={index}>
                            <label className={styles.Headerlabel}>{item.Title}{item.IsRequired ? <span style={{ color: "red" }}>*</span> : <></>}</label>
                            <DatePicker
                                componentRef={(input: any) => (inputRefs.current[item.InternalTitleName] = input)}
                                onSelectDate={(date: Date | null | undefined) => handleInputChange(item.InternalTitleName, date)}
                                className={meargestyles.control}
                                value={dynamicValues[item.InternalTitleName] || ""}
                                disabled={isDisabled}
                                formatDate={(date) => date ? moment(new Date(date)).format("DD/MM/YYYY") : ''}
                            />
                            {dynamicValuesErr[item.InternalTitleName] && <p style={{ color: "rgb(164, 38, 44)" }}>{dynamicValuesErr[item.InternalTitleName]}</p>}
                        </div>
                    );

                default:
                    return (
                        //<div className={dynamicControl.length > 5 ? styles.col6 : styles.col12} key={index}>
                        <div className="col-md-12" key={index}>
                            <TextField
                                type={"text"}
                                label={item.Title}
                                value={dynamicValues[item.InternalTitleName] || ""}
                                onChange={(ev, value) => handleInputChange(item.InternalTitleName, removeSepcialCharacters(value))}
                                multiline={item.ColumnType === "Multiple lines of Text"}
                                required={item.IsRequired}
                                errorMessage={dynamicValuesErr[item.InternalTitleName]}
                                disabled={isDisabled}
                                componentRef={(input: any) => (inputRefs.current[item.InternalTitleName] = input)}
                            />
                        </div>
                    );
            }
        });
    }, [dynamicControl, options, dynamicValues, dynamicValuesErr]);

    const clearErr = () => {
        setFolderNameErr("");
        setApproverErr("");
        setPublisherErr("");
        setFolderAccessErr("");
        setDynamicValuesErr({});
        setSuffixErr("");
        setOtherSuffixErr("");
        setFolderTemplateErr("");
    };

    const clearFeilds = () => {
        setFolderName("");
        setSuffix("");
        setOtherSuffix("");
        setDynamicValues({});
        setFolderAccess([]);
        setPublisher([]);
        setApprover([]);
        setIsApprovalRequired(false);
        setIsSuffixRequired(false);
    };

    const submit = async () => {
        // e.preventDefault();
        clearErr();
        let isValid = true;
        if (folderName.trim() === "") {
            setFolderNameErr(DisplayLabel.ThisFieldisRequired);
            inputRefs.current["FolderName"]?.focus();
            isValid = false;
            return;
        }
        if (isSuffixRequired && Suffix === "") {
            setSuffixErr(DisplayLabel.ThisFieldisRequired);
            inputRefs.current["Suffix"]?.focus();
            isValid = false;
            return;
        }
        if (Suffix === "Other" && OtherSuffix.trim() === "") {
            setOtherSuffixErr(DisplayLabel.ThisFieldisRequired);
            inputRefs.current["OtherSuffix"]?.focus();
            isValid = false;
            return;
        }

        if (dynamicControl.length > 0) {
            dynamicControl.filter((item: any, index: number) => !item.IsFieldAllowInFile).forEach((item: any) => {
                if (item.IsRequired && !dynamicValues[item.InternalTitleName]) {
                    setDynamicValuesErr((prev) => ({
                        ...prev,
                        [item.InternalTitleName]: DisplayLabel.ThisFieldisRequired,
                    }));
                    inputRefs.current[item.InternalTitleName]?.focus();
                    isValid = false;
                    return;
                }
            });
        }

        if (FormType === "EntryForm" && folderAccess.length === 0) {
            setFolderAccessErr(DisplayLabel.ThisFieldisRequired);
            inputRefs.current["FolderAccess"]?.focus();
            return;
        }
        if (isApprovalRequired && approver.length === 0) {
            setApproverErr(DisplayLabel.ThisFieldisRequired);
            inputRefs.current["Approver"]?.focus();
            isValid = false;
            return;
        }
        if (isApprovalRequired && publisher.length === 0) {
            setPublisherErr(DisplayLabel.ThisFieldisRequired);
            inputRefs.current["Publisher"]?.focus();
            isValid = false;
            return;
        }
        if (createStructure && folderTemplate === "") {
            setFolderTemplateErr(DisplayLabel.ThisFieldisRequired);
            inputRefs.current["FolderTemplate"]?.focus();
            isValid = false;
            return;
        }
        if (FormType === "EntryForm") {
            const data = await getAllFolder(context.pageContext.web.absoluteUrl, context, LibraryDetails.LibraryName);
            if (data && data.Folders.filter((el: any) => el.Name === folderName).length > 0) {
                setFolderNameErr(DisplayLabel.FolderAlreadyExist);
                inputRefs.current["FolderName"]?.focus();
                isValid = false;
                return;
            }
        }
        if (isValid)
            createFolder();
    };

    // const createFolder = async () => {
    //     setShowLoader({ display: "block" });
    //     if (FormType === "EntryForm") {
    //         const users = [...folderAccess, ...usersIds, ...publisher, ...approver, ...admin, LibraryDetails.TileAdminId];
    //         FolderStructure(context, `${LibraryDetails.LibraryName}/${folderName}`, users, LibraryDetails.LibraryName).then(async (response) => {
    //             console.log(response);
    //             await updateFolderMetaData(response);
    //             if (createStructure) {
    //                 createFolderStructure(users);
    //             }
    //         });
    //     }
    //     else {
    //         await updateFolderMetaData(folderObject.ListItemAllFields.Id);
    //         const folders = await getAllFolder(context.pageContext.web.absoluteUrl, context, folderPath);
    //         folders.Folders.map((folder: any) => { updateFolderMetaData(folder.ListItemAllFields.Id); });
    //     }
    // };
    const createFolder = async () => {
        setShowLoader({ display: "block" });
        if (FormType === "EntryForm") {
            // const users = [...folderAccess, ...usersIds, ...publisher, ...approver, ...admin, LibraryDetails.TileAdminId];

            //const users = [...folderAccess, ...usersIds, ...publisher, ...approver, ...admin, LibraryDetails.TileAdminId];

            // const users = [
            //   ...folderAccess.map(id => ({ id, type: 'FolderAccess' })),

            //   ...usersIds,
            //   ...publisher,
            //     ...approver,
            //   ...admin.map((id:any)=> ({ id, type: 'Admin' })),
            //   ...(LibraryDetails.TileAdminId
            //     ? [{ id: LibraryDetails.TileAdminId, type: 'TileAdmin' }]
            //     : []),
            // ];
            const users = [
                ...folderAccess.map(id => ({ id, type: 'FolderAccess' })),

                // Ensure all user IDs are properly handled
                ...usersIds.map(id => ({ id, type: 'User' })),

                // Publisher with a default 'Publisher' type
                ...publisher.map(id => ({ id, type: 'Publisher' })),

                // Approver with a default 'Approver' type
                ...approver.map(id => ({ id, type: 'Approver' })),

                // Admin users with 'Admin' type
                ...admin.map((id: any) => ({ id, type: 'Admin' })),

                // Conditional TileAdminId with 'TileAdmin' type if it exists
                ...(LibraryDetails.TileAdminId
                    ? [{ id: LibraryDetails.TileAdminId, type: 'TileAdmin' }]
                    : []),
            ];



            console.log(users);

            FolderStructure(context, `${LibraryDetails.LibraryName}/${folderName}`, users, LibraryDetails.LibraryName).then(async (response) => {
                console.log(response);
                await updateFolderMetaData(response);
                if (createStructure) {
                    createFolderStructure(users);
                }
            });
        }
        else {
            await updateFolderMetaData(folderObject.ListItemAllFields.Id);
            const folders = await getAllFolder(context.pageContext.web.absoluteUrl, context, folderPath);
            folders.Folders.map((folder: any) => { updateFolderMetaData(folder.ListItemAllFields.Id); });
        }
    };
    const updateFolderMetaData = (id: number) => {
        let obj: any = {
            ...dynamicValues,
            DocumentSuffix: Suffix || "",
            OtherSuffix: OtherSuffix || "",
            IsSuffixRequired: isSuffixRequired,
            PSType: "Suffix",
            DefineRole: isApprovalRequired,
            CreateFolder: createStructure,
            Template: folderTemplate,
        };
        if (isApprovalRequired) {
            const filterApprover = allUsers.filter((el: any) => el.Id === approver[0])[0];
            obj.ProjectmanagerAllow = true;
            obj.ProjectmanagerId = filterApprover.Id;
            obj.ProjectmanagerEmail = filterApprover.Email;
            const filterPublisher = allUsers.filter((el: any) => el.Id === publisher[0])[0];
            obj.PublisherAllow = true;
            obj.PublisherId = filterPublisher.Id;
            obj.PublisherEmail = filterPublisher.Email;
        }

        updateLibrary(context.pageContext.web.absoluteUrl, context.spHttpClient, obj, id, LibraryDetails.LibraryName).then((response) => {
            if (!createStructure) {
                dismissPanel(false);
                setShowLoader({ display: "none" });
                setAlertMsg(DisplayLabel.FolderUpdatedMsg);
                setIsPopupBoxVisible(true);
            }
        });
    };

    const createFolderStructure = async (users: any) => {
        const filterFolders = folderStructure.filter((el: any) => el.TemplateName.Name === folderTemplate);
        const firstlevel = getFirstLevel(filterFolders);
        let count = 0;
        firstlevel.map(async (folder: any) => {
            const response = await FolderStructure(context, `${LibraryDetails.LibraryName}/${folderName}/${folder.FolderName}`, users, LibraryDetails.LibraryName);
            await updateFolderMetaData(response);
            const ChildLevel = getEqualToData(filterFolders, folder.Id);
            await createChildFolder(ChildLevel, folder.FolderName, users);
            count++;
            if (firstlevel.length === count) {
                dismissPanel(false);
                setShowLoader({ display: "none" });
                setAlertMsg(DisplayLabel.SubmitMsg);
                setIsPopupBoxVisible(true);
            }
        });
    };

    const createChildFolder = async (folder: any, Name: any, users: any) => {
        folder.map(async (folder: any) => {
            const ChildLevel = getEqualToData(folderStructure, folder.Id);
            if (ChildLevel.length > 0) {
                const response = await FolderStructure(context, `${LibraryDetails.LibraryName}/${folderName}/${Name}/${folder.FolderName}`, users, LibraryDetails.LibraryName);
                await updateFolderMetaData(response);
                await createChildFolder(ChildLevel, `${Name}/${folder.FolderName}`, users);
            }
            else {
                const response = await FolderStructure(context, `${LibraryDetails.LibraryName}/${folderName}/${Name}/${folder.FolderName}`, users, LibraryDetails.LibraryName);
                await updateFolderMetaData(response);
            }
        });
    };

    function getFirstLevel(item: any) {
        return item.filter((it: any) => it.ParentFolderIdId == null);
    }

    function getEqualToData(Folders: any, id: number) {
        return Folders.filter((it: any) => it.ParentFolderIdId === id);
    }

    const bindFormData = () => {
        setFolderName(folderObject.Name);
        setIsSuffixRequired(folderObject.ListItemAllFields.IsSuffixRequired);
        if (folderObject.ListItemAllFields.IsSuffixRequired) {
            setSuffix(folderObject.ListItemAllFields.DocumentSuffix);
            folderObject.ListItemAllFields.DocumentSuffix === "Other" ? setOtherSuffix(folderObject.ListItemAllFields.OtherSuffix) : "";
        }
        setCreateStructure(folderObject.ListItemAllFields.CreateFolder);
        setFolderTemplate(folderObject.ListItemAllFields.Template);
        if (libraryDetails.AllowApprover) {
            setIsApprovalRequired(folderObject.ListItemAllFields.DefineRole);
            if (folderObject.ListItemAllFields.DefineRole) {
                setProjectManagerEmail(folderObject.ListItemAllFields.ProjectmanagerEmail);
                setPublisherEmail(folderObject.ListItemAllFields.PublisherEmail);
                setApprover([folderObject.ListItemAllFields.ProjectmanagerId]);
                setPublisher([folderObject.ListItemAllFields.PublisherId]);
            }
        }

        dynamicControl.map((item: any, index: number) => {
            const filterObj = configData.find((ele) => ele.Id === item.Id);
            if (!filterObj) return null;

            setDynamicValues((prevValues) => {
                let value = folderObject.ListItemAllFields[item.InternalTitleName];
                filterObj.ColumnType === "Date and Time" ? value = new Date(value) : "";
                return {
                    ...prevValues,
                    [item.InternalTitleName]: value,
                };
            });
        });

    };

    const hidePopup = useCallback(() => { setIsPopupBoxVisible(false); }, [isPopupBoxVisible]);
    const isValidNumberString = (value: string): boolean => {
        return !isNaN(Number(value)) && value.trim() !== "";
    };
    const removeSepcialCharacters = (newValue?: string) => newValue?.replace(/[^a-zA-Z0-9\s]/g, '') || '';
    return (
        <>
            <Panel
                headerText={panelTitle}
                isOpen={isOpen}
                onDismiss={() => dismissPanel(false)}
                closeButtonAriaLabel="Close"
                type={PanelType.medium}
                onRenderFooterContent={() => (
                    <>
                        {FormType !== "ViewForm" ? <PrimaryButton onClick={submit} styles={buttonStyles} className={styles["primary-btn"]}>{FormType === "EntryForm" ? DisplayLabel.Submit : DisplayLabel.Update}</PrimaryButton> : <></>}
                        <DefaultButton onClick={() => dismissPanel(false)} className={styles["light-btn"]}>{DisplayLabel.Cancel}</DefaultButton>
                    </>
                )}
                isFooterAtBottom={true}
            >
                <div className={styles.grid}>
                    <div className="row">
                        <div className="col-md-6">
                            <TextField
                                label={DisplayLabel.TileName}
                                value={LibraryDetails.TileName}
                                disabled
                            />
                        </div>
                        <div className="col-md-6">
                            <TextField
                                label={DisplayLabel.FolderName}
                                value={folderName}
                                required
                                onChange={(el: React.ChangeEvent<HTMLInputElement>, newValue?: string) => {
                                    const validName = removeSepcialCharacters(newValue);
                                    setFolderName(validName);
                                }}
                                errorMessage={folderNameErr}
                                disabled={isDisabled || FormType === "EditForm"}
                                componentRef={(input: any) => (inputRefs.current["FolderName"] = input)}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <Toggle
                                label={DisplayLabel.IsSuffixRequired}
                                onChange={handleToggleChange}
                                checked={isSuffixRequired}
                                disabled={isDisabled}
                            />
                        </div>
                    </div>

                    {isSuffixRequired && (
                        <>
                            <div className="row">
                                <div className="col-md-12">
                                    <label className={styles.Headerlabel}>{DisplayLabel.DocumentSuffix}<span style={{ color: "red" }}>*</span> </label>
                                    <Select
                                        options={SuffixData}
                                        value={SuffixData.find((option: any) => option.value === Suffix)}
                                        onChange={(option: any) => setSuffix(option.value as string)}
                                        isSearchable
                                        placeholder={DisplayLabel?.Selectanoption}
                                        isDisabled={isDisabled}
                                        ref={(input: any) => (inputRefs.current["Suffix"] = input)}
                                    />
                                    {SuffixErr && <p style={{ color: "rgb(164, 38, 44)" }}>{SuffixErr}</p>}
                                </div>
                            </div>

                            {Suffix === "Other" && (
                                <div className="row">
                                    <div className="col-md-12">
                                        <TextField
                                            label={DisplayLabel.OtherSuffixName}
                                            value={OtherSuffix}
                                            onChange={(el: React.ChangeEvent<HTMLInputElement>, newValue?: string) =>
                                                setOtherSuffix(removeSepcialCharacters(newValue))
                                            }
                                            errorMessage={OtherSuffixErr}
                                            required
                                            disabled={isDisabled}
                                            componentRef={(input: any) => (inputRefs.current["OtherSuffix"] = input)}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="row">{renderDynamicControls()}</div>
                    {libraryDetails.AllowApprover ? <div className="row">
                        <div className="col-md-12">
                            <Toggle
                                label={DisplayLabel.IsApprovalFlowRequired}
                                onChange={() => { setIsApprovalRequired((pre) => !pre); }}
                                disabled={isDisabled}
                                checked={isApprovalRequired}
                            />
                        </div>
                        {
                            isApprovalRequired ? <><div className="col-md-6">

                                <PeoplePicker
                                    titleText={DisplayLabel.Approver}
                                    context={peoplePickerContext}
                                    personSelectionLimit={1}
                                    showtooltip={true}
                                    required
                                    showHiddenInUI={false}
                                    principalTypes={[PrincipalType.User]}
                                    onChange={async (items) => {
                                        try {
                                            setProjectManagerEmail(items[0].secondaryText as string);
                                            const userIds = await Promise.all(
                                                items.map(async (item: any) => {
                                                    const data = await getUserIdFromLoginName(context, item.id);
                                                    return data.Id;
                                                })
                                            );
                                            setApprover(userIds);
                                        } catch (error) {
                                            console.error("Error fetching user IDs:", error);
                                        }
                                    }}
                                    defaultSelectedUsers={[projectManagerEmail]}
                                    errorMessage={approverErr}
                                    disabled={isDisabled}
                                    ref={(input: any) => (inputRefs.current["Approver"] = input)}
                                />
                            </div>
                                <div className="col-md-6">
                                    <PeoplePicker
                                        titleText={DisplayLabel.Publisher}
                                        context={peoplePickerContext}
                                        personSelectionLimit={1}
                                        showtooltip={true}
                                        required
                                        showHiddenInUI={false}
                                        principalTypes={[PrincipalType.User]}
                                        defaultSelectedUsers={[publisherEmail]}
                                        onChange={async (items) => {
                                            try {
                                                setPublisherEmail(items[0].secondaryText as string);
                                                const userIds = await Promise.all(
                                                    items.map(async (item: any) => {
                                                        const data = await getUserIdFromLoginName(context, item.id);
                                                        return data.Id;
                                                    })
                                                );
                                                setPublisher(userIds);
                                            } catch (error) {
                                                console.error("Error fetching user IDs:", error);
                                            }
                                        }}
                                        errorMessage={publisherErr}
                                        disabled={isDisabled}
                                        ref={(input: any) => (inputRefs.current["Publisher"] = input)}
                                    />

                                </div>
                            </> : <></>
                        }
                    </div> : <></>}
                    <div className="row">
                        <div className="col-md-12">
                            {FormType === "EntryForm" ? <PeoplePicker
                                titleText={DisplayLabel.FolderAccess}
                                context={peoplePickerContext}
                                personSelectionLimit={20}
                                showtooltip={true}
                                required
                                showHiddenInUI={false}
                                principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup, PrincipalType.SecurityGroup]}
                                onChange={async (items: any[]) => {
                                    try {
                                        const userIds = await Promise.all(
                                            items.map(async (item: any) => {
                                                let userid: number = 0;
                                                if (isValidNumberString(item.id)) {
                                                    userid = Number(item.id);
                                                } else {
                                                    const data = await getUserIdFromLoginName(context, item.id);
                                                    userid = data.Id;
                                                };
                                                return userid;
                                            })
                                        );
                                        setFolderAccess(userIds);
                                    } catch (error) {
                                        console.error("Error fetching user IDs:", error);
                                    }
                                }}
                                errorMessage={folderAccessErr}
                                ref={(input: any) => (inputRefs.current["FolderAccess"] = input)}
                            />
                                : <></>
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <Toggle
                                label={DisplayLabel.CreateStructure}
                                onChange={() => { setCreateStructure((pre) => !pre); }}
                                disabled={isDisabled || FormType === "EditForm"}
                                checked={createStructure}
                            />
                        </div>
                        {
                            createStructure ? <div className="col-md-6">
                                <label className={styles.Headerlabel}>{DisplayLabel.TemplateName}<span style={{ color: "red" }}>*</span> </label>
                                <Select
                                    options={allFolderTemplate}
                                    value={allFolderTemplate.find((option: any) => option.value === folderTemplate)}
                                    onChange={(option: any) => setFolderTemplate(option.value as string)}
                                    isSearchable
                                    placeholder={DisplayLabel?.Selectanoption}
                                    ref={(input: any) => (inputRefs.current["CreateStructure"] = input)}
                                    isDisabled={isDisabled || FormType === "EditForm"}
                                />
                                {folderTemplateErr && <p style={{ color: "rgb(164, 38, 44)" }}>{folderTemplateErr}</p>}
                            </div> : <></>
                        }
                    </div>
                </div>

            </Panel>
            <div className={cls["modal"]} style={showLoader}></div>
            <PopupBox isPopupBoxVisible={isPopupBoxVisible} hidePopup={hidePopup} msg={alertMsg} />
        </>
    );
};

export default memo(ProjectEntryForm);
