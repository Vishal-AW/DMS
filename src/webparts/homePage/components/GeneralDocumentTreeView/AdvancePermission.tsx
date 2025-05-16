import { Checkbox, Panel, PanelType, PrimaryButton } from "@fluentui/react";
import * as React from "react";
import styles from "./TreeView.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { useCallback, useEffect, useState } from "react";
import { commonPostMethod, getPermission } from "../../../../Services/GeneralDocument";
import PopupBox, { ConfirmationDialog } from "../ResuableComponents/PopupBox";
import { ILabel } from "../Interface/ILabel";
import { DefaultButton } from "office-ui-fabric-react";
import Select from "react-select";
export interface IAdvanceProps {
    isOpen: boolean;
    dismissPanel: () => void;
    context: WebPartContext;
    LibraryName: string;
    folderId: number;
}

const AdvancePermission: React.FC<IAdvanceProps> = ({ isOpen, dismissPanel, context, folderId, LibraryName }) => {
    const [option, setOption] = useState<string>("");
    const [hasUniquePermission, setHasUniquePermission] = useState<boolean>(false);
    const [userData, setUserData] = useState<any[]>([]);
    const [hideDialog, setHideDialog] = useState<boolean>(false);
    const [isCheckedUser, setIsCheckedUser] = useState<string[]>([]);
    const [isPopupBoxVisible, setIsPopupBoxVisible] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [selectedUser, setSelectedUser] = useState<number[]>([]);
    const [selectedUserError, setSelectedUserError] = useState("");
    const [selectedPermissionError, setSelectedPermissionError] = useState("");
    const DisplayLabel: ILabel = JSON.parse(localStorage.getItem('DisplayLabel') || '{}');
    const [alertMsg, setAlertMsg] = useState("");

    const peoplePickerContext: IPeoplePickerContext = {
        absoluteUrl: context.pageContext.web.absoluteUrl,
        msGraphClientFactory: context.msGraphClientFactory,
        spHttpClient: context.spHttpClient
    };




    const permissionDetails: Record<string, string> = {
        "1073741829": DisplayLabel.FullControlAccessDec,
        // "1073741828": DisplayLabel.DesignAccessDec,
        "1073741830": DisplayLabel.EditAccessDec,
        // "1073741827": DisplayLabel.ContributeAccessDec,
        "1073741826": DisplayLabel.ReadAccessDec,
        // "1073741832": DisplayLabel.RestrictedViewAccessDec,
        // "1073741924": DisplayLabel.ViewOnlyAccessDec
    };

    useEffect(() => {
        if (isOpen) bindPermission();
    }, [isOpen]);

    const bindPermission = async () => {
        if (isOpen) {
            setIsCheckedUser([]);
            try {
                const checkUniquePermissionQuery = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${LibraryName}')/items(${folderId})/HasUniqueRoleAssignments`;
                const getMemberQuery = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${LibraryName}')/items(${folderId})/roleassignments?$expand=RoleDefinitionBindings,Member`;

                const uniquePermissionResponse = await getPermission(checkUniquePermissionQuery, context);
                setHasUniquePermission(uniquePermissionResponse.value);

                const memberDataResponse = await getPermission(getMemberQuery, context);
                setUserData(memberDataResponse?.value || []);
            } catch (error) {
                console.error("Error binding permissions: ", error);
            }
        }
    };

    const handleSelectAllChange = () => {
        if (isCheckedUser.length === userData.length) {
            setIsCheckedUser([]); // Uncheck all
        } else {
            setIsCheckedUser(userData.map((user: any) => user.Member.Id)); // Check all
        }
    };

    const handleCheckboxChange = (userId: string) => {
        setIsCheckedUser((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId) // Remove userId if already checked
                : [...prev, userId] // Add userId if not checked
        );
    };

    const closeDialog = useCallback(() => setHideDialog(false), []);

    const handleConfirm = useCallback(
        async (value: boolean) => {
            if (value) {
                setHideDialog(false);
                const requestUri = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${LibraryName}')/items(${folderId})/breakroleinheritance(true)`;
                try {
                    await commonPostMethod(requestUri, context);
                    setAlertMsg(DisplayLabel.StopInheritingSuccessMsg);
                    setIsPopupBoxVisible(true);
                    bindPermission();
                } catch (error) {
                    console.error("Error stopping inheritance: ", error);
                }
            }
        },
        [context, folderId, LibraryName]
    );

    const hidePopup = useCallback(() => setIsPopupBoxVisible(false), []);

    const removeUserPermission = async () => {
        let count = 0;
        for (const userId of isCheckedUser) {
            const requestUri = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${LibraryName}')/items(${folderId})/roleassignments/removeroleassignment(principalid=${userId})`;
            try {
                setAlertMsg(DisplayLabel.AccessHasRemoved);
                await commonPostMethod(requestUri, context);
                count++;
                if (count === isCheckedUser.length) setIsPopupBoxVisible(true);
            } catch (error) {
                console.error("Error removing user permission: ", error);
            }
        }
    };
    const grantPermission = () => {
        setSelectedPermissionError("");
        setSelectedUserError("");
        if (selectedUser.length === 0)
            setSelectedUserError(DisplayLabel.ThisFieldisRequired);
        else if (option === "")
            setSelectedPermissionError(DisplayLabel.ThisFieldisRequired);
        else {
            let count = 0;
            selectedUser.map((el: any) => {
                setAlertMsg(DisplayLabel.AccessHasGranted);
                var requestUri = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${LibraryName}')/items(${folderId})/roleassignments/addroleassignment(principalid=${el},roledefid=${option})`;
                commonPostMethod(requestUri, context).then(function () {
                    count++;
                    if (count === selectedUser.length) setIsPopupBoxVisible(true);
                    // showAlert("Access has been successfully granted.");
                });
            });
        }
    };

    const handelPeoplePicker = (items: any) => {
        const ids: number[] = [];
        items.map(async (el: any) => {
            const userId = await getPermission(`${context.pageContext.web.absoluteUrl}/_api/web/siteusers?$filter=LoginName eq '${encodeURIComponent(el.id)}'`, context);
            if (userId) {
                ids.push(userId.value[0].Id);
            }
        });
        setSelectedUser(ids);
        console.log(ids);
    };
    const otions = [
        { value: "1073741829", label: DisplayLabel.FullControlAccess },
        { value: "1073741828", label: DisplayLabel.DesignAccess },
        { value: "1073741830", label: DisplayLabel.EditAccess },
        { value: "1073741827", label: DisplayLabel.ContributeAccess },
        { value: "1073741826", label: DisplayLabel.ReadAccess },
        { value: "1073741832", label: DisplayLabel.RestrictedViewAccess },
        { value: "1073741924", label: DisplayLabel.ViewOnlyAccess },
    ];




    return (
        <div>
            <Panel
                headerText={DisplayLabel.AdvancePermission}
                isOpen={isOpen}
                onDismiss={() => {
                    // dismissPanel();
                    // setOption("");
                    if (!hideDialog && !isPopupBoxVisible) { // Prevent dismiss when dialog/popup is open
                        dismissPanel();
                        setOption("");
                    }
                }}
                isBlocking={true} // This prevents clicking outside to close
                closeButtonAriaLabel="Close"
                type={PanelType.medium}
            >
                <div className={styles.grid}>
                    {/* Stop Inheriting Permissions */}
                    <div className="row">
                        <div className="col-md-6">
                            <PrimaryButton
                                text={DisplayLabel.StopInheritingPermission}
                                disabled={hasUniquePermission}
                                onClick={() => {
                                    setMessage(DisplayLabel.StopInheritingConfirmMsg);
                                    setHideDialog(true);
                                }}
                            />
                        </div>
                        <div className="col-md-6">
                            <PrimaryButton
                                text={DisplayLabel.RemoveUserPermission}
                                disabled={isCheckedUser.length === 0}
                                onClick={removeUserPermission}
                            />
                        </div>
                    </div>

                    {/* People Picker and Dropdown */}
                    <div className="row">
                        <div className="col-md-6">
                            <label className={styles.Headerlabel}>{DisplayLabel?.EnterName}<span style={{ color: "red" }}>*</span></label>

                            <PeoplePicker
                                // titleText={DisplayLabel.EnterName}
                                context={peoplePickerContext}
                                personSelectionLimit={20}
                                showtooltip={true}
                                required={true}
                                errorMessage={selectedUserError}
                                onChange={handelPeoplePicker}
                                showHiddenInUI={false}
                                principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup, PrincipalType.SecurityGroup]}
                            />
                        </div>
                        <div className="col-md-6">

                            <label className={styles.Headerlabel}>{DisplayLabel?.SelectPermissionLevel}<span style={{ color: "red" }}>*</span></label>
                            <Select
                                required
                                options={otions}
                                value={otions.find((item: any) => item.value === option)}
                                onChange={(opt: any) => setOption(opt?.value as string)}
                                isSearchable
                                placeholder={DisplayLabel?.Selectanoption}
                                style={{ margintop: "7px" }}
                            />
                            {selectedPermissionError && <p style={{ color: "rgb(164, 38, 44)" }}>{selectedPermissionError}</p>}
                        </div>
                    </div>

                    {/* Permission Details */}
                    <div className="row">
                        <div className="col-md-12">
                            {option && <span style={{ color: "red" }}>Note: {permissionDetails[option]}</span>}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6"><DefaultButton text={DisplayLabel.GrantPermissions} onClick={grantPermission} className={styles['primary-btn']} /></div>
                    </div>
                    {/* User Permissions Table */}
                    <div className="row">
                        <div className="col-md-12">
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>
                                            <Checkbox
                                                checked={isCheckedUser.length === userData.length}
                                                onChange={handleSelectAllChange}
                                            />
                                        </th>
                                        <th>Name</th>
                                        <th>Permission Levels</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userData.map((el: any) => (
                                        <tr key={el.Id}>
                                            <td>
                                                <Checkbox
                                                    checked={isCheckedUser.includes(el.Member.Id)}
                                                    onChange={() => handleCheckboxChange(el.Member.Id)}
                                                />
                                            </td>
                                            <td>{el.Member.Title}</td>
                                            <td>
                                                {el.RoleDefinitionBindings.map((item: any) => (
                                                    <React.Fragment key={item.Id}>
                                                        <p>{item.Name}</p>
                                                        <p className={styles.permissionDescription}>{item.Description}</p>
                                                    </React.Fragment>
                                                ))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Panel>
            <ConfirmationDialog hideDialog={hideDialog} closeDialog={closeDialog} handleConfirm={handleConfirm} msg={message} />
            <PopupBox isPopupBoxVisible={isPopupBoxVisible} hidePopup={hidePopup} msg={alertMsg} />
        </div>
    );
};

export default React.memo(AdvancePermission);