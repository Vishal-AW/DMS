import { ChoiceGroup, DatePicker, DefaultButton, Dropdown, IconButton, mergeStyleSets, Panel, PanelType, PrimaryButton, TextField } from "@fluentui/react";
import React, { useCallback, useEffect, useState } from 'react';
import styles from "./TreeView.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { getUserIdFromLoginName, uuidv4 } from "../../../../DAL/Commonfile";
import { getConfigActive } from "../../../../Services/ConfigService";
import { generateAutoRefNumber, getListData, updateLibrary, UploadFile, getDataByRefID } from "../../../../Services/GeneralDocument";
import { getDataByLibraryName } from "../../../../Services/MasTileService";
import PopupBox from "../ResuableComponents/PopupBox";
import { getStatusByInternalStatus } from "../../../../Services/StatusSerivce";
import cls from '../HomePage.module.scss';
import { ILabel } from "../Interface/ILabel";
import Select from "react-select";
import moment from "moment";
import { TileSendMail } from "../../../../Services/SendEmail";

interface IUploadFileProps {
    isOpenUploadPanel: boolean;
    dismissUploadPanel: () => void;
    folderPath: string;
    libName: string;
    folderName: string;
    context: WebPartContext;
    files: any;
    folderObject: any;
    LibraryDetails: any;
}
function UploadFiles({ context, isOpenUploadPanel, dismissUploadPanel, folderPath, libName, folderName, files, folderObject, LibraryDetails }: IUploadFileProps) {
    // const fileInputRef = useRef<HTMLInputElement | null>(null);
    const inValidExtensions = ["exe", "mp4", "mp3"];
    const DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
    const [configData, setConfigData] = useState<any[]>([]);
    const [dynamicControl, setDynamicControl] = useState<any[]>([]);
    // const [libraryDetails, setLibraryDetails] = useState<any>({});
    const [options, setOptions] = useState<any>({});
    const [dynamicValues, setDynamicValues] = useState<{ [key: string]: any; }>({});
    const [dynamicValuesErr, setDynamicValuesErr] = useState<{ [key: string]: string; }>({});
    const [attachmentsFiles, setAttachmentsFiles] = useState<any[]>([]);
    const [attachment, setAttachment] = useState<{ [key: string]: any; }>({});
    const [attachmentErr, setAttachmentErr] = useState<string>('');
    const [filesData, setFilesData] = useState<any[]>([]);
    const [filterFilesData, setFilterFilesData] = useState<any[]>([]);
    const [existingFile, setExistingFile] = useState<any[]>([]);
    const [isUpdateExistingFile, setIsUpdateExistingFile] = useState<boolean>(false);
    const [isPopupBoxVisible, setIsPopupBoxVisible] = useState<boolean>(false);
    const [showLoader, setShowLoader] = useState({ display: "none" });
    const [fileKey, setFileKey] = useState<number>(Date.now());
    const [alertMsg, setAlertMsg] = useState("");
    const [archiveCount, setArchiveCount] = useState("");

    const peoplePickerContext: IPeoplePickerContext = {
        absoluteUrl: context.pageContext.web.absoluteUrl,
        msGraphClientFactory: context.msGraphClientFactory,
        spHttpClient: context.spHttpClient
    };
    const meargestyles = mergeStyleSets({
        root: { selectors: { '> *': { marginBottom: 15 } } },
        control: { maxWidth: "100%", marginBottom: 15 },
    });



    useEffect(() => {
        fetchLibraryDetails();
    }, []);

    useEffect(() => {
        setAttachmentErr("");
        setDynamicValuesErr({});
        setDynamicValues({});
        setAttachmentsFiles([]);
        setExistingFile([]);
        setFilesData([]);
        setFilterFilesData([]);
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
            jsonData = jsonData.map((el: any) => {
                if (el.ColumnType === "Person or Group") {
                    el.InternalTitleName = `${el.InternalTitleName}Id`;
                }
                return el;
            });
            setDynamicControl(jsonData);
            bindDropdown(jsonData);
        }

        if (libraryData.value[0]?.ArchiveVersionCount) {
            setArchiveCount(libraryData.value[0]?.ArchiveVersionCount);
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
                    const data = await getListData(`${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${item.InternalListName}')/items?$top=5000&$filter=Active eq 1&$orderby=${item.DisplayValue} asc`, context);
                    dropdownOptions = data.value.map((ele: any) => ({
                        value: ele[item.DisplayValue],
                        label: ele[item.DisplayValue],
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
                        <div className="column6" key={index}>
                            <label className={styles.Headerlabel}>{item.Title}{item.IsRequired ? <span style={{ color: "red" }}>*</span> : <></>}</label>
                            <Select
                                options={options[item.InternalTitleName]}
                                required={item.IsRequired}
                                value={(options[item.InternalTitleName] || []).find((option: any) => option.value === dynamicValues[item.InternalTitleName])}
                                onChange={(option: any) => handleInputChange(item.InternalTitleName, option?.value)}
                                isSearchable
                                placeholder={DisplayLabel?.Selectanoption}
                                isMulti={item.ColumnType === "Multiple Select"}
                            />
                            {dynamicValuesErr[item.InternalTitleName] && <p style={{ color: "rgb(164, 38, 44)" }}>{dynamicValuesErr[item.InternalTitleName]}</p>}
                        </div>
                    );

                case "Person or Group":
                    return (
                        <div className="column6" key={index}>
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
                        <div className="column6" key={index}>
                            <ChoiceGroup
                                options={radioOptions}
                                onChange={(ev, option) => handleInputChange(item.InternalTitleName, option?.key)}
                                selectedKey={dynamicValues[item.InternalTitleName] || ""}
                                label={item.Title}
                                required={item.IsRequired}
                            />
                        </div>
                    );

                case "Date and Time":
                    return (
                        <div className="column6" key={index}>

                            <label className={styles.Headerlabel}>{item.Title}{item.IsRequired ? <span style={{ color: "red" }}>*</span> : <></>}</label>
                            <DatePicker
                                onSelectDate={(date: Date | null | undefined) => handleInputChange(item.InternalTitleName, date)}
                                className={meargestyles.control}
                                value={dynamicValues[item.InternalTitleName] || ""}
                                formatDate={(date) => date ? moment(new Date(date)).format("DD/MM/YYYY") : ''}
                            />
                            {dynamicValuesErr[item.InternalTitleName] && <p style={{ color: "rgb(164, 38, 44)" }}>{dynamicValuesErr[item.InternalTitleName]}</p>}
                        </div>
                    );

                default:
                    return (
                        <div className="column6" key={index}>
                            <TextField
                                type={"text"}
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

    // const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

    const addAttachment = () => {
        if (!attachment.name) {
            setAttachmentErr(DisplayLabel.ThisFieldisRequired);
            return false;
        }
        if (inValidExtensions.includes(attachment.name.split('.').pop())) {
            setAttachmentErr(DisplayLabel.InvalidFileFormat);
            return false;
        }

        if (attachment.size > MAX_FILE_SIZE) {
            setAttachmentErr(DisplayLabel.FileValidationForSize);
            return false;
        }

        setAttachmentErr('');
        const newAttachment = {
            attachment: attachment,
            isUpdateExistingFile: "No",
            OldFileName: "",
            version: "1.0",
            isDisabled: true,
            Flag: "New"
        };
        setAttachmentsFiles((prev) => [...prev, newAttachment]);
        setAttachment({});
        setFileKey(Date.now());
        // fileInputRef.current!.value = '';

    };

    const onClickDetails = (index: number) => {
        let IsExistingReferenceNo = "";
        if (attachmentsFiles[index].isUpdateExistingFile === "Yes") {
            let eFile = filterFilesData.filter((ele: any) => ele.Name == attachmentsFiles[index].OldFileName);
            IsExistingReferenceNo = eFile.length > 0 ? eFile[0].ListItemAllFields.IsExistingRefID : "";
            setExistingFile((per) => [...per, { ...eFile[0] }]);
            if (attachmentsFiles[index].OldFileName === "" || attachmentsFiles[index].OldFileName === null) {
                setAttachmentErr(DisplayLabel.ThisFieldisRequired);
                return false;
            }
        }
        setAttachmentsFiles((prev) => prev.map((ele, i) => i === index ? { ...ele, isDisabled: !ele.isDisabled, IsExistingRefID: IsExistingReferenceNo } : ele));
    };
    const submit = async () => {
        let isValid = true;
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
        if (attachmentsFiles.length === 0) {
            setAttachmentErr(DisplayLabel.ThisFieldisRequired);
            isValid = false;
        }
        if (!isValid) return;
        setShowLoader({ display: "block" });
        let count = 0;
        const queryURL = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getByTitle('${libName}')/items?$select=EncodedAbsUrl,*,File/Name&$expand=File&$top=1&$orderby=RefSequence desc`;
        const LastDocRes = await getListData(queryURL, context);
        if (LastDocRes.value[0].RefSequence == null || LastDocRes.value[0].RefSequence == undefined) {
            LastDocRes.value[0].RefSequence = 0;
        }

        attachmentsFiles.forEach(async (item) => {
            if (item.isUpdateExistingFile === "Yes") {
                existingFile.map(async (el) => {
                    await updateLibrary(context.pageContext.web.absoluteUrl, context.spHttpClient, { IsExistingFlag: "Old" }, el.ListItemAllFields.ID, libName);
                });
            }

            const Fileuniqueid = await uuidv4();
            const folderData = JSON.parse(JSON.stringify(folderObject, (key, value) => (value === null || (Array.isArray(value) && value.length === 0)) ? undefined : value));
            let obj: any = {
                ...folderData,
                ...dynamicValues,
                ActualName: item.attachment.name,
                FolderDocumentPath: `/${folderPath}`,
                OCRStatus: "Pending",
                UploadFlag: "Frontend",
                Level: item.version,
                IsExistingFlag: item.Flag,
                IsExistingRefID: item.IsExistingRefID,
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
            const refCount = LastDocRes.value[0].RefSequence == null ? 0 : LastDocRes.value[0].RefSequence + count;
            const ReferenceNo = generateAutoRefNumber(refCount, folderObject, LastDocRes.value[0].Created, LibraryDetails);

            obj.ReferenceNo = ReferenceNo.refNo.replace(/null/, "");
            obj.RefSequence = ReferenceNo.count;




            let UploadFileData = await UploadFile(context.pageContext.web.absoluteUrl, context.spHttpClient, item.attachment, `${Fileuniqueid}-${item.attachment.name}`, libName, obj, folderPath);
            console.log(UploadFileData);

            if (folderObject.DefineRole != null) {
                let emailObj: any = {
                    To: folderObject.ProjectmanagerEmail,
                    FolderPath: obj.FolderDocumentPath,
                    DocName: obj.ActualName,
                    AuthorTitle: context.pageContext.user.displayName,
                    TileName: libName,
                    Sub: DisplayLabel.PublisherEmailSubject + " " + obj.ReferenceNo,
                    Status: status.value[0].InternalStatus
                };
                emailObj.ID = folderObject.Id;
                emailObj.libraryName = libName;
                await TileSendMail(context, emailObj);
            }
            count++;

            if (item.IsExistingRefID !== "" && item.IsExistingRefID !== null && item.IsExistingRefID !== undefined) {
                if (LibraryDetails.IsArchiveRequired) {
                    const AllData = await getDataByRefID(context, item.IsExistingRefID, libName);
                    const ExistingRefData = AllData.value?.filter((ele: any) => ele.Active == true);
                    if (ExistingRefData?.length > archiveCount) {

                        const FileID = ExistingRefData[ExistingRefData?.length - 1].ID;
                        let updateArchiveObj = {
                            Active: false,
                            IsArchiveFlag: true
                        };

                        await updateLibrary(context.pageContext.web.absoluteUrl, context.spHttpClient, updateArchiveObj, FileID, libName);
                    }
                }
            }


            if (count === attachmentsFiles.length) {
                dismissUploadPanel();
                setShowLoader({ display: "none" });
                setAlertMsg(DisplayLabel.SubmitMsg);
                setIsPopupBoxVisible(true);
            }

        });
    };

    const hidePopup = useCallback(() => { setIsPopupBoxVisible(false); }, [isPopupBoxVisible]);

    return (
        <div>
            <Panel
                headerText={DisplayLabel.Upload}
                isOpen={isOpenUploadPanel}
                onDismiss={dismissUploadPanel}
                closeButtonAriaLabel="Close"
                type={PanelType.large}
                onRenderFooterContent={() => (<>
                    <PrimaryButton onClick={submit} styles={{ root: { marginRight: 8 } }} className={styles['primary-btn']}>{DisplayLabel.Submit}</PrimaryButton>
                    <DefaultButton onClick={dismissUploadPanel} className={styles['light-btn']}>{DisplayLabel.Cancel}</DefaultButton>
                </>)}
                isFooterAtBottom={true}
            >
                <div className={styles.grid}>
                    <div className="row">
                        <div className="column12">
                            <label>{DisplayLabel.Path}: <b>{folderPath}</b></label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="column6">
                            <TextField label={DisplayLabel.TileName} value={libName} />
                        </div>
                        <div className="column6">
                            <TextField label={DisplayLabel.FolderName} value={folderName} />
                        </div>
                    </div>
                    <div className="row">
                        {renderDynamicControls()}
                    </div>
                    <div className="row">
                        <div className="column10">
                            <label className={styles.Headerlabel}>{DisplayLabel.ChooseFile}<span style={{ color: "red" }}>*</span> </label>
                            <br></br>
                            <label className={styles.Headerlabel} style={{ color: "red" }}>
                                {DisplayLabel?.FileAttachmentNote}
                            </label>

                            <TextField type="file" onChange={(event: React.ChangeEvent<HTMLInputElement>) => { if (event.target.files) setAttachment(event.target.files[0]); }}
                                errorMessage={attachmentErr}
                                key={fileKey}
                            />

                        </div>
                        <div className="column2">
                            <IconButton
                                iconProps={{ iconName: 'Add' }}
                                style={{ background: "#009ef7", color: "#fff", border: "#009ef7", marginTop: "58px" }}
                                onClick={addAttachment}
                                label="Add"
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="column12">
                            {attachmentsFiles.length ? <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>{DisplayLabel.SrNo}</th>
                                        <th>{DisplayLabel.FileName}</th>
                                        <th>{DisplayLabel.IsthisAnUpdateToExistingFile}</th>
                                        {isUpdateExistingFile ? <th>{DisplayLabel.FileName}</th> : <></>}
                                        <th>{DisplayLabel.Versions}</th>
                                        <th>{DisplayLabel.Action}</th>
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
                                                    onChange={async (ev, option) => {
                                                        const attach = await Promise.all(attachmentsFiles.map((ele, i) => i === index ? { ...ele, isUpdateExistingFile: option?.key } : ele));
                                                        let filterFiles = files.filter((el: any) => el.ListItemAllFields.IsExistingFlag === "New");
                                                        if (filterFiles.length > 0 && attachmentsFiles.length > 0) {
                                                            attachmentsFiles.map((el: any) => {
                                                                filterFiles = filterFiles.filter((ele: any) => {
                                                                    if (el.name !== "" && item.name != el.name) {
                                                                        return ele.ListItemAllFields.Active === true && ele.ListItemAllFields.IsExistingFlag === "New" && el.name != ele.Name;
                                                                    } else {
                                                                        return ele.ListItemAllFields.Active === true && ele.ListItemAllFields.IsExistingFlag === "New";
                                                                    }
                                                                });
                                                            });
                                                        }
                                                        setFilterFilesData(filterFiles);
                                                        setFilesData(filterFiles.map((el: any) => ({ value: el.Name, label: el.ListItemAllFields.ActualName })));
                                                        setAttachmentsFiles(attach);
                                                        // await setAttachmentsFiles((prev) => prev.map((ele, i) => i === index ? { ...ele, isUpdateExistingFile: option?.key } : ele));
                                                        const filterD = attach.filter((el, i) => el.isUpdateExistingFile === "Yes");
                                                        filterD.length > 0 ? setIsUpdateExistingFile(option?.key === "Yes" ? true : false) : "";
                                                    }}
                                                    disabled={item.isDisabled}
                                                />
                                            </td>
                                            {isUpdateExistingFile ? <td>

                                                <Select
                                                    options={filesData}
                                                    value={filesData.find((option: any) => option.value === item.OldFileName)}
                                                    onChange={(option: any) => {
                                                        const fData = filterFilesData.filter((ele: any) => ele.Name == option?.value);
                                                        let level = 1.0;
                                                        if (fData.length > 0)
                                                            level = parseFloat(fData[0].ListItemAllFields.Level) + 1.0;

                                                        setAttachmentsFiles((prev) => prev.map((ele, i) => i === index ? { ...ele, OldFileName: option?.value, version: level.toFixed(1) } : ele));
                                                    }}
                                                    isSearchable
                                                    placeholder={DisplayLabel?.Selectanoption}
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
            <PopupBox isPopupBoxVisible={isPopupBoxVisible} hidePopup={hidePopup} msg={alertMsg} />
            <div className={cls["modal"]} style={showLoader}></div>
        </div>
    );
}

export default React.memo(UploadFiles);

