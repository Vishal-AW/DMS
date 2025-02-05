import React, { memo, useCallback, useEffect, useState } from "react";
import {
    ChoiceGroup,
    DefaultButton,
    Dropdown,
    Panel,
    PanelType,
    PrimaryButton,
    TextField,
    Toggle,
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

    // const peoplePickerContext: IPeoplePickerContext = {
    //     absoluteUrl: context.pageContext.web.absoluteUrl,
    //     msGraphClientFactory: context.msGraphClientFactory as any as import("@pnp/spfx-controls-react/node_modules/@microsoft/sp-http-msgraph/dist/index-internal").MSGraphClientFactory,
    //     spHttpClient: context.spHttpClient as any as import("@pnp/spfx-controls-react/node_modules/@microsoft/sp-http-base/dist/index-internal").SPHttpClient
    // };



    const handleToggleChange = (_: React.MouseEvent<HTMLElement>, checked?: boolean) => {
        setIsSuffixRequired(!!checked);
    };

    useEffect(() => {
        fetchLibraryDetails();
        fetchSuffixData();
        getAllUsers();
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

    }, [isOpen]);


    const getAllUsers = async () => {
        const data = await getListData(`${context.pageContext.web.absoluteUrl}/_api/web/siteusers?$filter=PrincipalType eq 1`, context);
        if (data.value.length > 0) {
            setAllUsers(data.value);
        }
    };
    // const getAdmin = async () => {
    //     const data = await getListData(`${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('DMS_GroupName')/items`, context);
    //     setAdmin(data.value.map((el: any) => (el.GroupNameId)));
    // };
    const fetchSuffixData = async () => {
        const data = await getActiveTypeData(
            context.pageContext.web.absoluteUrl,
            context.spHttpClient,
            "Suffix"
        );
        const column = data.value.map((item: any) => ({
            key: item.PSName,
            text: item.PSName,
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
                        key: ele,
                        text: ele,
                    }));
                } else {
                    const data = await getListData(
                        `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${item.InternalListName}')/items?$top=5000&$filter=Active eq 1&$orderby=${item.DisplayValue} asc`,
                        context
                    );
                    dropdownOptions = data.value.map((ele: any) => ({
                        key: ele[item.DisplayValue],
                        text: ele[item.DisplayValue],
                    }));
                }
                setOptions((prev: any) => ({ ...prev, [item.InternalTitleName]: dropdownOptions }));
            }
        });
    };

    const renderDynamicControls = useCallback(() => {
        return dynamicControl.map((item: any, index: number) => {
            const filterObj = configData.find((ele) => ele.Id === item.Id);

            if (!filterObj) return null;

            switch (item.ColumnType) {
                case "Dropdown":
                case "Multiple Select":
                    return (
                        <div className={dynamicControl.length > 5 ? styles.col6 : styles.col12} key={index}>
                            <Dropdown
                                label={item.Title}
                                options={options[item.InternalTitleName] || []}
                                required={item.IsRequired}
                                multiSelect={item.ColumnType === "Multiple Select"}
                                onChange={(ev, option) => handleInputChange(item.InternalTitleName, option?.key)}
                                selectedKey={dynamicValues[item.InternalTitleName] || ""}
                                errorMessage={dynamicValuesErr[item.InternalTitleName]}
                                disabled={isDisabled}
                            />
                        </div>
                    );

                case "Person or Group":
                    return (
                        <div className={dynamicControl.length > 5 ? styles.col6 : styles.col12} key={index}>
                            <PeoplePicker
                                titleText={item.Title}
                                context={peoplePickerContext}
                                personSelectionLimit={1}
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
                            />
                        </div>
                    );

                case "Radio":
                    const radioOptions = filterObj.StaticDataObject.split(";").map((ele: string) => ({
                        key: ele,
                        text: ele,
                    }));
                    return (
                        <div className={dynamicControl.length > 5 ? styles.col6 : styles.col12} key={index}>
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

                default:
                    return (
                        <div className={dynamicControl.length > 5 ? styles.col6 : styles.col12} key={index}>
                            <TextField
                                type={item.ColumnType === "Date and Time" ? "date" : "text"}
                                label={item.Title}
                                value={dynamicValues[item.InternalTitleName] || ""}
                                onChange={(ev, value) => handleInputChange(item.InternalTitleName, removeSepcialCharacters(value))}
                                multiline={item.ColumnType === "Multiple lines of Text"}
                                required={item.IsRequired}
                                errorMessage={dynamicValuesErr[item.InternalTitleName]}
                                disabled={isDisabled}
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

    const submit = () => {
        // e.preventDefault();
        clearErr();
        let isValid = true;
        if (folderName.trim() === "") {
            setFolderNameErr(DisplayLabel.ThisFieldisRequired);
            isValid = false;
            return;
        }
        if (isSuffixRequired && Suffix === "") {
            setSuffixErr(DisplayLabel.ThisFieldisRequired);
            isValid = false;
            return;
        }
        if (Suffix === "Other" && OtherSuffix.trim() === "") {
            setOtherSuffixErr(DisplayLabel.ThisFieldisRequired);
            isValid = false;
            return;
        }

        if (dynamicControl.length > 0) {
            dynamicControl.forEach((item: any) => {
                if (item.IsRequired && !dynamicValues[item.InternalTitleName]) {
                    setDynamicValuesErr((prev) => ({
                        ...prev,
                        [item.InternalTitleName]: DisplayLabel.ThisFieldisRequired,
                    }));
                    isValid = false;
                    return;
                }
            });
        }

        if (FormType === "EntryForm" && folderAccess.length === 0) {
            setFolderAccessErr(DisplayLabel.ThisFieldisRequired);
            isValid = false;
            return;
        }
        if (isApprovalRequired && approver.length === 0) {
            setApproverErr(DisplayLabel.ThisFieldisRequired);
            isValid = false;
            return;
        }
        if (isApprovalRequired && publisher.length === 0) {
            setPublisherErr(DisplayLabel.ThisFieldisRequired);
            isValid = false;
            return;
        }
        if (isValid)
            createFolder();
    };

    const createFolder = async () => {
        setShowLoader({ display: "block" });
        if (FormType === "EntryForm") {
            const users = [...folderAccess, ...usersIds, ...publisher, ...approver, ...admin];
            FolderStructure(context, `${LibraryDetails.LibraryName}/${folderName}`, users, LibraryDetails.LibraryName).then((response) => {
                updateFolderMetaData(response);
            });
        }
        else {
            updateFolderMetaData(folderObject.ListItemAllFields.Id);
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
            DefineRole: isApprovalRequired
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
            dismissPanel(false);
            setShowLoader({ display: "none" });
            setIsPopupBoxVisible(true);
        });
    };

    const bindFormData = () => {
        setFolderName(folderObject.Name);
        setIsSuffixRequired(folderObject.ListItemAllFields.IsSuffixRequired);
        if (folderObject.ListItemAllFields.IsSuffixRequired) {
            setSuffix(folderObject.ListItemAllFields.DocumentSuffix);
            folderObject.ListItemAllFields.DocumentSuffix === "Other" ? setOtherSuffix(OtherSuffix) : "";
        }
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
                return {
                    ...prevValues,
                    [item.InternalTitleName]: value,
                };
            });
        });

    };

    const hidePopup = useCallback(() => { setIsPopupBoxVisible(false); }, [isPopupBoxVisible]);

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
                        {FormType !== "ViewForm" ? <PrimaryButton onClick={submit} styles={buttonStyles} className={styles["info-btn"]}>{FormType === "EntryForm" ? DisplayLabel.Submit : DisplayLabel.Update}</PrimaryButton> : <></>}
                        <DefaultButton onClick={() => dismissPanel(false)} className={styles["light-btn"]}>{DisplayLabel.Cancel}</DefaultButton>
                    </>
                )}
                isFooterAtBottom={true}
            >
                <div className={styles.grid}>
                    <div className={styles.row}>
                        <div className={styles.col6}>
                            <TextField
                                label={DisplayLabel.TileName}
                                value={LibraryDetails.TileName}
                                disabled
                            />
                        </div>
                        <div className={styles.col6}>
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
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.col12}>
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
                            <div className={styles.row}>
                                <div className={styles.col12}>
                                    <Dropdown
                                        label={DisplayLabel.DocumentSuffix}
                                        options={SuffixData}
                                        required
                                        onChange={(ev, option: any) => setSuffix(option.key as string)}
                                        selectedKey={Suffix}
                                        errorMessage={SuffixErr}
                                        disabled={isDisabled}
                                    />
                                </div>
                            </div>

                            {Suffix === "Other" && (
                                <div className={styles.row}>
                                    <div className={styles.col12}>
                                        <TextField
                                            label={DisplayLabel.OtherSuffixName}
                                            value={OtherSuffix}
                                            onChange={(el: React.ChangeEvent<HTMLInputElement>, newValue?: string) =>
                                                setOtherSuffix(removeSepcialCharacters(newValue))
                                            }
                                            errorMessage={OtherSuffixErr}
                                            required
                                            disabled={isDisabled}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className={styles.row}>{renderDynamicControls()}</div>
                    {libraryDetails.AllowApprover ? <div className={styles.row}>
                        <div className={styles.col12}>
                            <Toggle
                                label={DisplayLabel.IsApprovalFlowRequired}
                                onChange={() => { setIsApprovalRequired((pre) => !pre); }}
                                disabled={isDisabled}
                                checked={isApprovalRequired}
                            />
                        </div>
                        {
                            isApprovalRequired ? <><div className={styles.col6}>

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
                                />
                            </div>
                                <div className={styles.col6}>
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
                                    />

                                </div>
                            </> : <></>
                        }
                    </div> : <></>}
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            {FormType === "EntryForm" ? <PeoplePicker
                                titleText={DisplayLabel.FolderAccess}
                                context={peoplePickerContext}
                                personSelectionLimit={10}
                                showtooltip={true}
                                required
                                showHiddenInUI={false}
                                // principalTypes={[PrincipalType.User]}
                                onChange={async (items) => {
                                    try {
                                        const userIds = await Promise.all(
                                            items.map(async (item: any) => {
                                                const data = await getUserIdFromLoginName(context, item.id);
                                                return data.Id;
                                            })
                                        );
                                        setFolderAccess(userIds);
                                    } catch (error) {
                                        console.error("Error fetching user IDs:", error);
                                    }
                                }}
                                errorMessage={folderAccessErr}
                            />
                                : <></>
                            }
                        </div>
                    </div>
                </div>

            </Panel>
            <div className={cls["modal"]} style={showLoader}></div>
            <PopupBox isPopupBoxVisible={isPopupBoxVisible} hidePopup={hidePopup} />
        </>
    );
};

export default memo(ProjectEntryForm);
