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
import { getListData, updateLibrary } from "../../../../Services/GeneralDocument";
import { FolderStructure } from "../../../../Services/FolderStructure";
import { getUserIdFromLoginName } from "../../../../DAL/Commonfile";
import PopupBox from "../ResuableComponents/PopupBox";

export interface IAdvanceProps {
    isOpen: boolean;
    dismissPanel: (value: boolean) => void;
    context: WebPartContext;
    LibraryDetails: any;
    folderPath: string;
}

const ProjectEntryForm: React.FC<IAdvanceProps> = ({
    isOpen,
    dismissPanel,
    context,
    LibraryDetails,
    folderPath
}) => {
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
    // const [pSType, setPSType] = useState([]);
    const [isPopupBoxVisible, setIsPopupBoxVisible] = useState(false);
    const handleInputChange = (fieldName: string, value: any) => {
        setDynamicValues((prevValues) => ({
            ...prevValues,
            [fieldName]: value,
        }));
    };

    const peoplePickerContext: IPeoplePickerContext = {
        absoluteUrl: context.pageContext.web.absoluteUrl,
        msGraphClientFactory: context.msGraphClientFactory,
        spHttpClient: context.spHttpClient,
    };



    const handleToggleChange = (_: React.MouseEvent<HTMLElement>, checked?: boolean) => {
        setIsSuffixRequired(!!checked);
    };

    useEffect(() => {
        fetchLibraryDetails();
        fetchSuffixData();
        fetchConfigData();
        console.log(libraryDetails);
    }, []);

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

    const fetchConfigData = async () => {
        const data = await getConfigActive(
            context.pageContext.web.absoluteUrl,
            context.spHttpClient
        );
        setConfigData(data.value);
    };

    const fetchLibraryDetails = async () => {
        const dataConfig = await getConfigActive(context.pageContext.web.absoluteUrl, context.spHttpClient);
        const libraryData = await getDataByLibraryName(context.pageContext.web.absoluteUrl, context.spHttpClient, LibraryDetails.LibraryName);

        setLibraryDetails(libraryData.value[0]);
        setConfigData(dataConfig.value);

        if (libraryData.value[0]?.DynamicControl) {
            let jsonData = JSON.parse(libraryData.value[0].DynamicControl);
            jsonData = jsonData.filter((ele: any) => ele.IsActiveControl);
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
                                placeholder="Select an option"
                                label={item.Title}
                                options={options[item.InternalTitleName] || []}
                                required={item.IsRequired}
                                multiSelect={item.ColumnType === "Multiple Select"}
                                onChange={(ev, option) => handleInputChange(item.InternalTitleName, option?.key)}
                                selectedKey={dynamicValues[item.InternalTitleName] || ""}
                            />
                        </div>
                    );

                case "Person or Group":
                    return (
                        <div className={dynamicControl.length > 5 ? styles.col6 : styles.col12} key={index}>
                            <PeoplePicker
                                titleText={item.Title}
                                context={peoplePickerContext}
                                personSelectionLimit={10}
                                showtooltip={true}
                                required={item.IsRequired}
                                showHiddenInUI={false}
                                principalTypes={[PrincipalType.User]}
                                onChange={(items) => handleInputChange(item.InternalTitleName, items)}
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
                                onChange={(ev, value) => handleInputChange(item.InternalTitleName, value)}
                                multiline={item.ColumnType === "Multiple lines of Text"}
                                required={item.IsRequired}
                            />
                        </div>
                    );
            }
        });
    }, [dynamicControl, options, dynamicValues]);

    const submit = () => {
        setIsPopupBoxVisible(true);
        FolderStructure(context, `${folderPath}/${folderName}`, folderAccess, [], LibraryDetails.LibraryName).then((response) => {
            console.log(response);
            let obj = {
                ...dynamicValues,
                // IsSuffixRequired: isSuffixRequired,
                DocumentSuffix: Suffix,
                OtherSuffix: OtherSuffix,
            };
            updateLibrary(context.pageContext.web.absoluteUrl, context.spHttpClient, obj, response, LibraryDetails.LibraryName).then((response) => {
                setIsPopupBoxVisible(false);
                dismissPanel(false);
            });
        });
    };
    const hidePopup = useCallback(() => { setIsPopupBoxVisible(false); }, [isPopupBoxVisible]);
    return (
        <Panel
            headerText="Advance Permission"
            isOpen={isOpen}
            onDismiss={() => dismissPanel(false)}
            closeButtonAriaLabel="Close"
            type={PanelType.large}
            onRenderFooterContent={() => (<>
                <PrimaryButton onClick={() => { submit(); console.log(dynamicValues); }} styles={buttonStyles} className={styles["sub-btn"]}>Submit</PrimaryButton>
                <DefaultButton onClick={() => dismissPanel(false)} className={styles["can-btn"]}>Cancel</DefaultButton>
            </>)}
            isFooterAtBottom={true}
        >
            <div className={styles.grid}>
                <div className={styles.row}>
                    <div className={styles.col6}>
                        <TextField
                            label="Tile"
                            value={LibraryDetails.TileName}
                            disabled
                        />
                    </div>
                    <div className={styles.col6}>
                        <TextField
                            label="Folder Name"
                            value={folderName}
                            required
                            onChange={(el: React.ChangeEvent<HTMLInputElement>) =>
                                setFolderName(el.target.value)
                            }
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.col12}>
                        <Toggle
                            label="Is Suffix required?"
                            onChange={handleToggleChange}
                        />
                    </div>
                </div>

                {isSuffixRequired && (
                    <>
                        <div className={styles.row}>
                            <div className={styles.col12}>
                                <Dropdown
                                    placeholder="Select an option"
                                    label="Document Suffix"
                                    options={SuffixData}
                                    required
                                    onChange={(ev, option: any) => setSuffix(option.key as string)}
                                    selectedKey={Suffix}
                                />
                            </div>
                        </div>

                        {Suffix === "Other" && (
                            <div className={styles.row}>
                                <div className={styles.col12}>
                                    <TextField
                                        label="Other Suffix Name"
                                        value={OtherSuffix}
                                        onChange={(el: React.ChangeEvent<HTMLInputElement>) =>
                                            setOtherSuffix(el.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div className={styles.row}>{renderDynamicControls()}</div>
                <div className={styles.row}>
                    <div className={styles.col12}>
                        <PeoplePicker
                            titleText={"Folder Access"}
                            context={peoplePickerContext}
                            personSelectionLimit={10}
                            showtooltip={true}
                            required
                            showHiddenInUI={false}
                            principalTypes={[PrincipalType.User]}
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
                        />
                    </div>
                </div>
            </div>
            <PopupBox isPopupBoxVisible={isPopupBoxVisible} hidePopup={hidePopup} />
        </Panel>
    );
};

export default memo(ProjectEntryForm);
