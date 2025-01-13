import { ChoiceGroup, DefaultButton, Dropdown, IconButton, Panel, PanelType, PrimaryButton, TextField } from "@fluentui/react";
import React, { useCallback, useEffect, useState } from 'react';
import styles from "./TreeView.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { getUserIdFromLoginName, uuidv4 } from "../../../../DAL/Commonfile";
import { getConfigActive } from "../../../../Services/ConfigService";
import { getListData, UploadFile } from "../../../../Services/GeneralDocument";
import { getDataByLibraryName } from "../../../../Services/MasTileService";
import PopupBox from "../ResuableComponents/PopupBox";
import { getStatusByInternalStatus } from "../../../../Services/StatusSerivce";
interface IUploadFileProps {
    isOpenUploadPanel: boolean;
    dismissUploadPanel: () => void;
    folderPath: string;
    libName: string;
    folderName: string;
    context: WebPartContext;
    files: any;
    folderObject: any;
}
function UploadFiles({ context, isOpenUploadPanel, dismissUploadPanel, folderPath, libName, folderName, files, folderObject }: IUploadFileProps) {

    const [configData, setConfigData] = useState<any[]>([]);
    const [dynamicControl, setDynamicControl] = useState<any[]>([]);
    // const [libraryDetails, setLibraryDetails] = useState<any>({});
    const [options, setOptions] = useState<any>({});
    const [dynamicValues, setDynamicValues] = useState<{ [key: string]: any; }>({});
    const [dynamicValuesErr, setDynamicValuesErr] = useState<{ [key: string]: string; }>({});
    const [attachmentsFiles, setAttachmentsFiles] = useState<any[]>([]);
    const [attachment, setAttachment] = useState<{ [key: string]: any; }>({});
    const [attachmentErr, setAttachmentErr] = useState<string>('');
    const filesData = files.map((item: any) => ({ key: item.name, text: item.ActualName }));
    const [isUpdateExistingFile, setIsUpdateExistingFile] = useState<boolean>(false);
    const [isPopupBoxVisible, setIsPopupBoxVisible] = useState<boolean>(false);

    const peoplePickerContext: IPeoplePickerContext = {
        absoluteUrl: context.pageContext.web.absoluteUrl,
        msGraphClientFactory: context.msGraphClientFactory,
        spHttpClient: context.spHttpClient
    };

    useEffect(() => {
        fetchLibraryDetails();
    }, []);

    useEffect(() => {
        setDynamicValuesErr({});
        setDynamicValues({});
        setAttachmentsFiles([]);
    }, [isOpenUploadPanel]);

    const handleInputChange = (key: string, value: any) => {
        setDynamicValues((prev) => ({ ...prev, [key]: value }));
    };
    const fetchLibraryDetails = async () => {
        const dataConfig = await getConfigActive(context.pageContext.web.absoluteUrl, context.spHttpClient);
        const libraryData = await getDataByLibraryName(context.pageContext.web.absoluteUrl, context.spHttpClient, libName);

        // setLibraryDetails(libraryData.value[0]);
        setConfigData(dataConfig.value);

        if (libraryData.value[0]?.DynamicControl) {
            let jsonData = JSON.parse(libraryData.value[0].DynamicControl);
            jsonData = jsonData.filter((ele: any) => ele.IsActiveControl && ele.IsFieldAllowInFile);
            setDynamicControl(jsonData);
            bindDropdown(jsonData);
        }
    };

    const bindDropdown = (dynamic: any) => {
        let dropdownOptions = [{ key: "", text: "Select an option" }];
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

    const removeSepcialCharacters = (newValue?: string) => newValue?.replace(/[^a-zA-Z0-9\s]/g, '') || '';

    const renderDynamicControls = useCallback(() => {
        return dynamicControl.map((item: any, index: number) => {
            const filterObj = configData.find((ele) => ele.Id === item.Id);

            if (!filterObj) return null;

            switch (item.ColumnType) {
                case "Dropdown":
                case "Multiple Select":
                    return (
                        <div className={styles.col6} key={index}>
                            <Dropdown
                                placeholder="Select an option"
                                label={item.Title}
                                options={options[item.InternalTitleName] || []}
                                required={item.IsRequired}
                                multiSelect={item.ColumnType === "Multiple Select"}
                                onChange={(ev, option) => handleInputChange(item.InternalTitleName, option?.key)}
                                selectedKey={dynamicValues[item.InternalTitleName] || ""}
                                errorMessage={dynamicValuesErr[item.InternalTitleName]}
                            />
                        </div>
                    );

                case "Person or Group":
                    return (
                        <div className={styles.col6} key={index}>
                            <PeoplePicker
                                titleText={item.Title}
                                context={peoplePickerContext}
                                personSelectionLimit={10}
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
                                            [item.InternalTitleName]: userIds,
                                        }));
                                    } catch (error) {
                                        console.error("Error fetching user IDs:", error);
                                    }
                                }}
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
                        <div className={styles.col6} key={index}>
                            <ChoiceGroup
                                options={radioOptions}
                                onChange={(ev, option) => handleInputChange(item.InternalTitleName, option?.key)}
                                selectedKey={dynamicValues[item.InternalTitleName] || ""}
                                label={item.Title}
                                required={item.IsRequired}
                            />
                        </div>
                    );

                default:
                    return (
                        <div className={styles.col6} key={index}>
                            <TextField
                                type={item.ColumnType === "Date and Time" ? "date" : "text"}
                                label={item.Title}
                                value={dynamicValues[item.InternalTitleName] || ""}
                                onChange={(ev, value) => handleInputChange(item.InternalTitleName, removeSepcialCharacters(value))}
                                multiline={item.ColumnType === "Multiple lines of Text"}
                                required={item.IsRequired}
                                errorMessage={dynamicValuesErr[item.InternalTitleName]}
                            />
                        </div>
                    );
            }
        });
    }, [dynamicControl, options, dynamicValues, dynamicValuesErr]);

    const addAttachment = () => {
        if (!attachment.name) {
            setAttachmentErr('Please select a file');
            return false;
        }
        setAttachmentErr('');
        const newAttachment = {
            attachment: attachment,
            isUpdateExistingFile: "No",
            OldFileName: "",
            version: "1.0",
            isDisabled: true,
        };
        setAttachmentsFiles((prev) => [...prev, newAttachment]);
        setAttachment({});
    };

    const onClickDetails = (index: number) => {
        setAttachmentsFiles((prev) => prev.map((ele, i) => i === index ? { ...ele, isDisabled: !ele.isDisabled } : ele));
    };
    const submit = () => {
        let isValid = true;
        if (dynamicControl.length > 0) {
            dynamicControl.forEach((item: any) => {
                if (item.IsRequired && !dynamicValues[item.InternalTitleName]) {
                    setDynamicValuesErr((prev) => ({
                        ...prev,
                        [item.InternalTitleName]: `${item.Title} is required`,
                    }));
                    isValid = false;
                    return;
                }
            });
        }
        if (attachmentsFiles.length === 0) {
            setAttachmentErr('Please select a file');
            isValid = false;
        }
        if (!isValid) return;
        let count = 0;
        attachmentsFiles.forEach(async (item) => {
            const Fileuniqueid = await uuidv4();
            let obj: any = {
                ...folderObject,
                ...dynamicValues,
                ActualName: item.attachment.name,
                FolderDocumentPath: `/${folderPath}`,
                OCRStatus: "Pending",
                UploadFlag: "Frontend"
            };
            let InternalStatus = "Published";
            if (folderObject.DefineRole) {
                obj.CurrentApprover = folderObject.ProjectmanagerEmail === null ? folderObject.PublisherEmail : folderObject.ProjectmanagerEmail;
                InternalStatus = folderObject.ProjectmanagerEmail == null ? "PendingWithPublisher" : "PendingWithPM";
            }

            const res = item.attachment.name.split('.').slice(0, -1).join('.');
            const extension = item.attachment.name.split('.').pop();
            const rename = (res).replace(/[^a-z0-9-\s]/gi, '');
            if (folderObject.DocumentSuffix !== null && folderObject.DocumentSuffix !== "") {
                let suffix = folderObject.DocumentSuffix;

                if (folderObject.DocumentSuffix === "Other") {
                    suffix = folderObject.OtherSuffix;
                }
                obj.ActualName = folderObject.PSType === "Prefix" ? `${suffix}_${rename}.${extension}` : obj.ActualName = `${rename}_${suffix}.${extension}`;
            }
            const status = await getStatusByInternalStatus(context.pageContext.web.absoluteUrl, context.spHttpClient, InternalStatus);

            obj.StatusId = status.value[0].ID;
            obj.InternalStatus = status.value[0].InternalStatus;
            obj.DisplayStatus = status.value[0].StatusName;
            obj.Active = true;
            await UploadFile(context.pageContext.web.absoluteUrl, context.spHttpClient, item.attachment, `${Fileuniqueid}-${item.attachment.name}`, libName, obj, folderPath);
            count++;

            if (count === attachmentsFiles.length) {
                setIsPopupBoxVisible(true);
            }

        });
    };

    const hidePopup = useCallback(() => { setIsPopupBoxVisible(false); dismissUploadPanel(); }, [isPopupBoxVisible]);

    return (
        <div>
            <Panel
                headerText="Upload Document"
                isOpen={isOpenUploadPanel}
                onDismiss={dismissUploadPanel}
                closeButtonAriaLabel="Close"
                type={PanelType.large}
                onRenderFooterContent={() => (<>
                    <PrimaryButton onClick={submit} styles={{ root: { marginRight: 8 } }} className={styles["sub-btn"]}>Submit</PrimaryButton>
                    <DefaultButton onClick={dismissUploadPanel} className={styles["can-btn"]}>Cancel</DefaultButton>
                </>)}
                isFooterAtBottom={true}
            >
                <div className={styles.grid}>
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <label>Path: <b>{folderPath}</b></label>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col6}>
                            <TextField label="Tile Name" value={libName} />
                        </div>
                        <div className={styles.col6}>
                            <TextField label="Folder Name" value={folderName} />
                        </div>
                    </div>
                    <div className={styles.row}>
                        {renderDynamicControls()}
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col10}>
                            <TextField type="file" label="Choose File" required onChange={(event: React.ChangeEvent<HTMLInputElement>) => { if (event.target.files) setAttachment(event.target.files[0]); }}
                                errorMessage={attachmentErr}
                            />
                        </div>
                        <div className={styles.col2}>
                            <IconButton
                                iconProps={{ iconName: 'Add' }}
                                style={{ background: "#009ef7", color: "#fff", border: "#009ef7" }}
                                onClick={addAttachment}
                                label=""
                            />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            {attachmentsFiles.length ? <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Sr. No.</th>
                                        <th>File Name</th>
                                        <th>Is this an update to existing file</th>
                                        {isUpdateExistingFile ? <th>File Name</th> : <></>}
                                        <th>Version</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attachmentsFiles?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.attachment.name}</td>
                                            <td>
                                                <Dropdown
                                                    options={[
                                                        { key: 'Yes', text: 'Yes' },
                                                        { key: 'No', text: 'No' },
                                                    ]}
                                                    selectedKey={item.isUpdateExistingFile}
                                                    onChange={(ev, option) => {
                                                        setAttachmentsFiles((prev) => prev.map((ele, i) => i === index ? { ...ele, isUpdateExistingFile: option?.key } : ele));
                                                        const filterD = attachmentsFiles.filter((el, i) => el.isUpdateExistingFile === "Yes" && el.i !== index);
                                                        filterD.length === 1 ? setIsUpdateExistingFile(option?.key === "Yes" ? true : false) : "";
                                                    }}
                                                    disabled={item.isDisabled}
                                                />
                                            </td>
                                            {isUpdateExistingFile ? <td>
                                                <Dropdown
                                                    options={filesData}
                                                    selectedKey={item.OldFileName}
                                                    onChange={(ev, option) => setAttachmentsFiles((prev) => prev.map((ele, i) => i === index ? { ...ele, OldFileName: option?.key } : ele))}
                                                    disabled={item.isDisabled}
                                                />
                                            </td> : <></>}
                                            <td>
                                                <TextField value={item.version}
                                                    disabled
                                                />
                                            </td>
                                            <td>
                                                <IconButton
                                                    iconProps={{ iconName: item.isDisabled ? 'Edit' : 'Save' }}
                                                    style={{ color: '009ef7' }}
                                                    onClick={() => onClickDetails(index)}
                                                />
                                                <IconButton
                                                    iconProps={{ iconName: 'Delete' }}
                                                    style={{ color: 'red' }}
                                                    onClick={() => setAttachmentsFiles((prev) => prev.filter((ele, i) => i !== index))}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table> : <></>
                            }
                        </div>
                    </div>
                </div>
            </Panel>
            <PopupBox isPopupBoxVisible={isPopupBoxVisible} hidePopup={hidePopup} />
        </div>
    );
}

export default React.memo(UploadFiles);