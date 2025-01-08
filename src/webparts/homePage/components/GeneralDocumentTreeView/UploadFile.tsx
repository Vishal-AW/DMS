import { ChoiceGroup, DefaultButton, Dropdown, IconButton, Panel, PanelType, PrimaryButton, TextField } from "@fluentui/react";
import React, { useCallback, useEffect, useState } from 'react';
import styles from "./TreeView.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { getUserIdFromLoginName } from "../../../../DAL/Commonfile";
import { getConfigActive } from "../../../../Services/ConfigService";
import { getListData } from "../../../../Services/GeneralDocument";
import { getDataByLibraryName } from "../../../../Services/MasTileService";
interface IUploadFileProps {
    isOpenUploadPanel: boolean;
    dismissUploadPanel: () => void;
    folderPath: string;
    libName: string;
    folderName: string;
    context: WebPartContext;
    files: any;
}
const submit = () => { };
export default function UploadFile({ context, isOpenUploadPanel, dismissUploadPanel, folderPath, libName, folderName, files }: IUploadFileProps) {

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
            ...attachment,
            isUpdateExistingFile: "No",
            OldFileName: "",
            version: "1.0",
        };

        setAttachmentsFiles((prev) => [...prev, newAttachment]);
    };


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
                                        <th>File Name</th>
                                        <th>Version</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attachmentsFiles.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td>
                                                <Dropdown
                                                    options={[
                                                        { key: 'Yes', text: 'Yes' },
                                                        { key: 'No', text: 'No' },
                                                    ]}
                                                    selectedKey={item.isUpdateExistingFile}
                                                />
                                            </td>
                                            <td>
                                                <Dropdown
                                                    options={filesData}
                                                    selectedKey={item.OldFileName}
                                                />
                                            </td>
                                            <td>
                                                <TextField value={item.Version} />
                                            </td>
                                            <td>
                                                <IconButton
                                                    iconProps={{ iconName: 'Edit' }}
                                                    style={{ color: '009ef7' }}
                                                />
                                                <IconButton
                                                    iconProps={{ iconName: 'Delete' }}
                                                    style={{ color: 'red' }}
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
        </div>
    );
}
