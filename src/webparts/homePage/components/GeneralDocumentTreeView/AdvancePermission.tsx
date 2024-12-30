import { Checkbox, Dropdown, IDropdownStyles, Panel, PanelType, PrimaryButton } from "@fluentui/react";
import * as React from "react";
import styles from "./TreeView.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { useCallback, useEffect, useState } from "react";
import { commonPostMethod, getPermission } from "../../../../Services/GeneralDocument";
import PopupBox, { ConfirmationDialog } from "../ResuableComponents/PopupBox";

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

    const peoplePickerContext: IPeoplePickerContext = {
        absoluteUrl: context.pageContext.web.absoluteUrl,
        msGraphClientFactory: context.msGraphClientFactory,
        spHttpClient: context.spHttpClient
    };

    const dropdownStyles: Partial<IDropdownStyles> = {
        dropdown: { width: 300 },
    };

    const permissionDetails: Record<string, string> = {
        "1073741829": "Has full control.",
        "1073741828": "Can view, add, update, delete, approve, and customize.",
        "1073741830": "Can add, edit and delete lists; can view, add, update and delete list items and documents.",
        "1073741827": "Can view, add, update, and delete list items and documents.",
        "1073741826": "Can view pages and list items and download documents.",
        "1073741832": "Can view pages, list items, and documents. Documents can be viewed in the browser but not downloaded.",
        "1073741924": "Can view pages, list items, and documents. Document types with server-side file handlers can be viewed in the browser but not downloaded."
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
            setSelectedUserError("Select User");
        else if (option === "")
            setSelectedPermissionError("Select Permission");
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
                headerText="Advance Permission"
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
                                text="Stop Inheriting Permission"
                                disabled={hasUniquePermission}
                                onClick={() => {
                                    setMessage("You are about to create unique permissions for this folder.");
                                    setHideDialog(true);
                                }}
                            />
                        </div>
                        <div className={styles.col6}>
                            <PrimaryButton
                                text="Remove User Permission"
                                disabled={isCheckedUser.length === 0}
                                onClick={removeUserPermission}
                            />
                        </div>
                    </div>

                    {/* People Picker and Dropdown */}
                    <div className={styles.row}>
                        <div className={styles.col6}>
                            <PeoplePicker
                                titleText="Enter names"
                                context={peoplePickerContext}
                                personSelectionLimit={10}
                                showtooltip={true}
                                required={true}
                                errorMessage={selectedUserError}
                                onChange={handelPeoplePicker}
                                showHiddenInUI={false}
                                principalTypes={[PrincipalType.User]}
                            />
                        </div>
                        <div className={styles.col6}>
                            <Dropdown
                                required={true}
                                placeholder="Select an option"
                                label="Select Permission Level"
                                options={[
                                    { key: "1073741829", text: "Full Control" },
                                    { key: "1073741828", text: "Design" },
                                    { key: "1073741830", text: "Edit" },
                                    { key: "1073741827", text: "Contribute" },
                                    { key: "1073741826", text: "Read" },
                                    { key: "1073741832", text: "Restricted View" },
                                    { key: "1073741924", text: "View Only" },
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
                        <div className={styles.col6}><PrimaryButton text="Grant Permissions" onClick={grantPermission} /></div>
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
                                                indeterminate={
                                                    isCheckedUser.length > 0 && isCheckedUser.length < userData.length
                                                }
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
