import { DefaultButton, Dropdown, IDropdownOption, Panel, PanelType, TextField, Toggle } from "office-ui-fabric-react";
import { ILabel } from '../Interface/ILabel';
import * as React from "react";
import styles from "./Master.module.scss";
import { useEffect, useState } from "react";
//import { getAllListFromSite } from "../../../../Services/ConfigService";


export default function ConfigMaster({ props }: any): JSX.Element {

    const [DisplayLabel, setDisplayLabel] = useState<ILabel>();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [ColumnTypeID, setColumnTypeID] = useState('');
    const [IsShowasFilter, setIsShowasFilter] = React.useState<boolean>(false);
    const [IsStaticValue, setIsStaticValues] = React.useState<boolean>(false);
    // const [ListData, setListData] = useState([]);

    //const [ColumnTypeText, setColumnTypeText] = useState('');
    //const [setFieldName, setFieldName] = useState("");


    useEffect(() => {
        let DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
        setDisplayLabel(DisplayLabel);
        //   getAllListSite();


    }, []);

    // const getAllListSite = async () => {

    //     let ListData: any = await getAllListFromSite(props.SiteURL, props.spHttpClient);

    //     let ListvalueData = ListData.value;

    //     console.log(ListvalueData);


    //     let options: any = [];

    //     ListvalueData.forEach((InternalTitleNameData: { Title: any; ID: any; InternalTitleName: any; }) => {

    //         options.push({

    //             key: InternalTitleNameData.ID,

    //             text: InternalTitleNameData.Title

    //         });

    //     });

    //     setListData(options);
    // }
    const openAddPanel = () => {
        // clearField();
        setIsEditMode(false);
        setIsPanelOpen(true);
    };

    const closePanel = () => {
        setIsPanelOpen(false);
    };

    const handleIsShowasFilterToggleChange = (checked: boolean): void => {
        setIsShowasFilter(checked);
    };

    const handleIsStaticValueToggleChange = (checked: boolean): void => {
        setIsStaticValues(checked);
    };


    const dropdownOptions: IDropdownOption[] = [
        { key: 'Single line of Text', text: 'Single line of Text' },
        { key: 'Multiple lines of Text', text: 'Multiple lines of Text' },
        { key: 'Dropdown', text: 'Dropdown' },
        { key: 'Multiple Select', text: 'Multiple Select' },
        { key: 'Radio', text: 'Radio' },
        { key: 'Date and Time', text: 'Date and Time' },
        { key: 'Person or Group', text: 'Person or Group' },
    ];

    const handleColumnTypeonChange = (
        event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
        setColumnTypeID(option?.key as string);
        //setColumnTypeText(option?.text as string);
    };



    return (
        <div>
            <div className={styles.alignbutton} style={{ paddingRight: '0px' }}>
                <DefaultButton id="requestButton" className={styles.submit} text={DisplayLabel?.Add} onClick={openAddPanel}  ></DefaultButton>
            </div>

            <Panel
                isOpen={isPanelOpen}
                onDismiss={closePanel}
                closeButtonAriaLabel="Close"
                type={PanelType.large}
                isFooterAtBottom={true}

                headerText={isEditMode ? "Edit New Records" : "Add New Records"}
            >
                <div className={`ms-Grid ${styles.inlineFormContainer}`}>
                    <div className="col-md-5">
                        <div className="form-group">
                            <label className={styles.Headerlabel}>{DisplayLabel?.FieldName}<span style={{ color: "red" }}>*</span></label>

                            {/* <TextField label="Title" errorMessage={TileError} value={TileName} onChange={(e: any) => { setTileName(e.target.value); }} /> */}
                            <TextField
                                placeholder="Enter Field Name"
                                //errorMessage={FieldNameError}
                                value={""}
                            //  onChange={(el: React.ChangeEvent<HTMLInputElement>) => setFieldName(el.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="form-group">
                            <label className={styles.Headerlabel}>{DisplayLabel?.ColumnType}<span style={{ color: "red" }}>*</span></label>
                            <Dropdown
                                placeholder="Select an Option"
                                options={dropdownOptions}
                                onChange={handleColumnTypeonChange}
                                selectedKey={ColumnTypeID}
                                errorMessage=''
                            />
                        </div>
                    </div>
                </div>
                <br /><br />
                <div className={`ms-Grid ${styles.inlineFormContainer}`}>
                    <div className="col-md-5">
                        <div className="form-group">
                            <label className={styles.Headerlabel}>{DisplayLabel?.IsShowasFilter}<span style={{ color: "red" }}>*</span></label>

                            <Toggle checked={IsShowasFilter} onChange={(_, checked) => handleIsShowasFilterToggleChange(checked!)} />

                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="form-group">
                            <label className={styles.Headerlabel}>{DisplayLabel?.IsStaticValue}<span style={{ color: "red" }}>*</span></label>
                            <Toggle checked={IsStaticValue} onChange={(_, checked) => handleIsStaticValueToggleChange(checked!)} />

                        </div>
                    </div>
                </div>

                <br /><br />
                <div className={`ms-Grid ${styles.inlineFormContainer}`}>
                    <div className="col-md-5">
                        <div className="form-group">
                            <label className={styles.Headerlabel}>{DisplayLabel?.ListName}<span style={{ color: "red" }}>*</span></label>

                            <Dropdown
                                placeholder="Select an Option"
                                options={dropdownOptions}
                                onChange={handleColumnTypeonChange}
                                selectedKey={ColumnTypeID}
                                errorMessage=''
                            />
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="form-group">
                            <label className={styles.Headerlabel}>{DisplayLabel?.DisplayColumn}<span style={{ color: "red" }}>*</span></label>
                            <Dropdown
                                placeholder="Select an Option"
                                options={dropdownOptions}
                                onChange={handleColumnTypeonChange}
                                selectedKey={ColumnTypeID}
                                errorMessage=''
                            />
                        </div>
                    </div>
                </div>



            </Panel>


        </div>

    )
}