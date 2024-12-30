import { ChoiceGroup, Dropdown, IChoiceGroupOption, Panel, PanelType, TextField, Toggle } from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import React, { useEffect, useState } from 'react';
import styles from "./TreeView.module.scss";
import { getActiveTypeData } from "../../../../Services/PrefixSuffixMasterService";
import { getConfigActive } from "../../../../Services/ConfigService";
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
export interface IAdvanceProps {
    isOpen: boolean;
    dismissPanel: () => void;
    context: WebPartContext;
    LibraryDetails: any;
}
const ProjectEntryForm: React.FC<IAdvanceProps> = ({ isOpen, dismissPanel, context, LibraryDetails }) => {
    const [folderName, setFolderName] = useState<string>('');
    const [isSuffixRequired, setIsSuffixRequired] = useState<boolean>(false);
    const [SuffixData, setSuffixData] = useState<any[]>([]);
    const [Suffix, setSuffix] = useState<string>('');
    const [OtherSuffix, setOtherSuffix] = useState<string>('');
    const [configData, setConfigData] = useState<any[]>([]);
    const [dynamicControl, setDynamicControl] = useState<any[]>([]);

    const peoplePickerContext: IPeoplePickerContext = {
        absoluteUrl: context.pageContext.web.absoluteUrl,
        msGraphClientFactory: context.msGraphClientFactory,
        spHttpClient: context.spHttpClient
    };
    const handelPeoplePicker = (items: any[]) => { };

    const _onChange = (ev: React.MouseEvent<HTMLElement>, checked?: boolean) => {
        setIsSuffixRequired(!!checked);
    };
    useEffect(() => {
        getSuffixData();
        getConfigData();
    }, []);
    const getSuffixData = async () => {
        const data = await getActiveTypeData(context.pageContext.web.absoluteUrl, context.spHttpClient, 'Suffix');
        const column = data.value.map((item: any) => ({ key: item.PSName, text: item.PSName }));
        setSuffixData(column);
    };

    const getConfigData = async () => {
        const data = await getConfigActive(context.pageContext.web.absoluteUrl, context.spHttpClient);
        setConfigData(data.value);
        if (LibraryDetails.DynamicControl != "" && LibraryDetails.DynamicControl != null) {
            let jsonData = JSON.parse(LibraryDetails.DynamicControl);
            jsonData = jsonData.filter((ele: any) => ele.IsActiveControl);
            setDynamicControl(jsonData);
        }
    };
    const _onChangeRedio = (ev: React.FormEvent<HTMLInputElement>, option: IChoiceGroupOption): void => {
        console.dir(option);
    };
    const bindControl = () => {
        return dynamicControl.map((item: any, index: number) => {
            const filterObj = configData.filter((ele, ind) => (ele.Id == item.Id))[0];
            let htm;
            if (filterObj) {
                // if (dynamicControl.length > 5) {
                if (item.ColumnType === "Dropdown" || item.ColumnType === "Choice") {
                    htm = <div className={styles.col6}>
                        <TextField label={item.Title} value={item.ControlValue} />
                    </div>;
                }
                else if (item.ColumnType === "Person or Group") {
                    htm = <div className={styles.col6}>
                        <PeoplePicker
                            titleText={item.Title}
                            context={peoplePickerContext}
                            personSelectionLimit={10}
                            showtooltip={true}
                            required={true}
                            onChange={handelPeoplePicker}
                            showHiddenInUI={false}
                            principalTypes={[PrincipalType.User]}
                        />
                    </div>;
                }
                else if (item.ColumnType === "Multiple lines of Text") {
                    htm = <div className={styles.col6}>
                        <TextField multiline label={item.Title} value={item.ControlValue} />
                    </div>;
                }
                else if (item.ColumnType === "Radio") {
                    const radioOption = filterObj.StaticDataObject.split(';');
                    const option = radioOption.map((ele: any, ind: number) => ({ key: ele, text: ele }));
                    htm = <div className={styles.col6}>
                        <ChoiceGroup options={option} onChange={_onChangeRedio} label="Pick one" required={true} />
                    </div>;
                }
                else {
                    htm = <div className={styles.col6}>
                        <TextField type={item.ColumnType === "Date and Time" ? "date" : "text"} label={item.Title} value={item.ControlValue} />
                    </div>;
                }

                // }
            }
            return htm;
        });

    };
    return (
        <>
            <Panel
                headerText="Advance Permission"
                isOpen={isOpen}
                onDismiss={() => dismissPanel()}
                closeButtonAriaLabel="Close"
                type={PanelType.medium}
            >
                <div className={styles.grid}>
                    <div className={styles.row}>
                        <div className={styles.col6}>
                            <TextField label="Tile" value={LibraryDetails.TileName} disabled />
                        </div>
                        <div className={styles.col6}>
                            <TextField label="Folder Name" value={folderName} required aria-required onChange={(el: React.ChangeEvent<HTMLInputElement>) => setFolderName(el.target.value)} />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            <Toggle label="Is Suffix required?" onChange={_onChange} />
                        </div>
                    </div>
                    {
                        isSuffixRequired && <>
                            <div className={styles.row}>
                                <div className={styles.col12}>
                                    <Dropdown
                                        placeholder="Select an option"
                                        label="Document Suffix"
                                        options={SuffixData}
                                        required
                                        onChange={(ev: any, option: any) => setSuffix(option.key)}
                                        selectedKey={Suffix}
                                    />
                                </div>
                            </div>
                            {Suffix === "Other" ? <div className={styles.row}>
                                <div className={styles.col12}>
                                    <TextField label="Other Suffix Name" value={OtherSuffix} onChange={(el: React.ChangeEvent<HTMLInputElement>) => setOtherSuffix(el.target.value)} />
                                </div>
                            </div> : <></>}
                        </>
                    }
                    <div className={styles.row} >
                        {
                            bindControl()
                        }
                    </div>

                </div>

            </Panel>
        </>
    );
};

export default ProjectEntryForm;