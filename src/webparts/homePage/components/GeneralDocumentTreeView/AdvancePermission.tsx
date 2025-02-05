import { Checkbox, Dropdown, IDropdownStyles, Panel, PanelType, PrimaryButton } from "@fluentui/react";
import * as React from "react";
import styles from "./TreeView.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { useCallback, useEffect, useState } from "react";
import { commonPostMethod, getPermission } from "../../../../Services/GeneralDocument";
import PopupBox, { ConfirmationDialog } from "../ResuableComponents/PopupBox";
import { ILabel } from "../Interface/ILabel";
import { DefaultButton } from "office-ui-fabric-react";

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



    const dropdownStyles: Partial<IDropdownStyles> = {
        dropdown: { width: 300 },
    };

    const permissionDetails: Record<string, string> = {
        "1073741829": DisplayLabel.FullControlAccessDec,
        "1073741828": DisplayLabel.DesignAccessDec,
        "1073741830": DisplayLabel.EditAccessDec,
        "1073741827": DisplayLabel.ContributeAccessDec,
        "1073741826": DisplayLabel.ReadAccessDec,
        "1073741832": DisplayLabel.RestrictedViewAccessDec,
        "1073741924": DisplayLabel.ViewOnlyAccessDec
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
                setUserData(memberDataResponse.value);
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

    return (
        <div>
            <Panel
                headerText={DisplayLabel.AdvancePermission}
                isOpen={isOpen}
                onDismiss={() => {
                    dismissPanel();
                    setOption("");
                }}
                closeButtonAriaLabel="Close"
                type={PanelType.medium}
            >
                <div className={styles.grid}>
                    {/* Stop Inheriting Permissions */}
                    <div className={styles.row}>
                        <div className={styles.col6}>
                            <PrimaryButton
                                text={DisplayLabel.StopInheritingPermission}
                                disabled={hasUniquePermission}
                                onClick={() => {
                                    setMessage(DisplayLabel.StopInheritingConfirmMsg);
                                    setHideDialog(true);
                                }}
                            />
                        </div>
                        <div className={styles.col6}>
                            <PrimaryButton
                                text={DisplayLabel.RemoveUserPermission}
                                disabled={isCheckedUser.length === 0}
                                onClick={removeUserPermission}
                            />
                        </div>
                    </div>

                    {/* People Picker and Dropdown */}
                    <div className={styles.row}>
                        <div className={styles.col6}>
                            <PeoplePicker
                                titleText={DisplayLabel.EnterName}
                                context={peoplePickerContext}
                                personSelectionLimit={10}
                                showtooltip={true}
                                required={true}
                                errorMessage={selectedUserError}
                                onChange={handelPeoplePicker}
                                showHiddenInUI={false}
                                principalTypes={[PrincipalType.User, PrincipalType.SharePointGroup]}
                            />
                        </div>
                        <div className={styles.col6}>
                            <Dropdown
                                required={true}
                                label={DisplayLabel.SelectPermissionLevel}
                                options={[
                                    { key: "1073741829", text: DisplayLabel.FullControlAccess },
                                    { key: "1073741828", text: DisplayLabel.DesignAccess },
                                    { key: "1073741830", text: DisplayLabel.EditAccess },
                                    { key: "1073741827", text: DisplayLabel.ContributeAccess },
                                    { key: "1073741826", text: DisplayLabel.ReadAccess },
                                    { key: "1073741832", text: DisplayLabel.RestrictedViewAccess },
                                    { key: "1073741924", text: DisplayLabel.ViewOnlyAccess },
                                ]}
                                errorMessage={selectedPermissionError}
                                styles={dropdownStyles}
                                onChange={(ev, opt) => setOption(opt?.key as string)}
                            />
                        </div>
                    </div>

                    {/* Permission Details */}
                    <div className={styles.row}>
                        <div className={styles.col12}>
                            {option && <span style={{ color: "red" }}>Note: {permissionDetails[option]}</span>}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col6}><DefaultButton text={DisplayLabel.GrantPermissions} onClick={grantPermission} className={styles.primaryBtn} /></div>
                    </div>
                    {/* User Permissions Table */}
                    <div className={styles.row}>
                        <div className={styles.col12}>
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
            <PopupBox isPopupBoxVisible={isPopupBoxVisible} hidePopup={hidePopup} />
        </div>
    );
};

export default React.memo(AdvancePermission);
