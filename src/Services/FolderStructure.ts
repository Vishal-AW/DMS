import { SPHttpClient, SPHttpClientResponse } from "@microsoft/sp-http-base";
import { WebPartContext } from "@microsoft/sp-webpart-base";


export const FolderStructure = async (context: WebPartContext, FolderPath: string, uid: number[], LibraryName: string) => {

    const folderUrl = `${context.pageContext.web.absoluteUrl}/${FolderPath}`;
    return await context.spHttpClient.post(
        `${context.pageContext.web.absoluteUrl}/_api/web/folders?$expand=ListItemAllFields`,
        SPHttpClient.configurations.v1,
        {
            headers: {
                Accept: "application/json;odata=nometadata",
                "odata-version": "3.0",
                "X-HTTP-Method": "POST",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ServerRelativeUrl: folderUrl }),
        }
    ).then(async (response: SPHttpClientResponse) => {
        if (response.ok) {
            const data = await response.json();
            await breakRoleInheritance(context, FolderPath, uid, LibraryName, data.ListItemAllFields.ID);
            return data.ListItemAllFields.ID;
        }
    }).catch((error) => {
        console.error('Error creating folder:', error);
    });
};

const breakRoleInheritance = async (context: WebPartContext, folderUrl: string, userIds: number[], LibraryName: string, Id: number) => {

    const breakInheritanceUrl = `${context.pageContext.web.absoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderUrl}')/ListItemAllFields/breakroleinheritance(true)`;
    return await context.spHttpClient.post(
        breakInheritanceUrl,
        SPHttpClient.configurations.v1,
        {
            headers: {
                Accept: 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
            },
        }
    ).then(async (response: SPHttpClientResponse) => {
        if (response.ok) {
            await grantPermissions(context, folderUrl, [...userIds]);
            return await removeAllPermissions(context, folderUrl, [...userIds]);

        }
    });

};

const grantPermissions = async (context: WebPartContext, folderUrl: string, userIds: number[]) => {
    try {
        for (const userId of userIds) {
            const permissionUrl = `${context.pageContext.web.absoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderUrl}')/ListItemAllFields/roleassignments/addroleassignment(principalid=${userId},roleDefId=1073741827)`;
            const response = await context.spHttpClient.post(
                permissionUrl,
                SPHttpClient.configurations.v1,
                {
                    headers: {
                        Accept: 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                    },
                }
            );

            if (!response.ok) {
                console.error('Failed to grant permission for user ID:', userId);
            }
        }
    } catch (error) {
        console.error(error);
    }
};


const removeAllPermissions = async (context: WebPartContext, folderUrl: string, userIds: number[]) => {
    const roleAssignmentsUrl = `${context.pageContext.web.absoluteUrl}/_api/web/GetFolderByServerRelativeUrl('${folderUrl}')/ListItemAllFields/roleassignments`;

    try {
        return await context.spHttpClient.get(roleAssignmentsUrl,
            SPHttpClient.configurations.v1,
            {
                headers: {
                    'Accept': 'application/json;odata=nometadata',
                    'odata-version': ''
                }
            }).then(async (response: SPHttpClientResponse) => {
                if (response.ok) {
                    const data = await response.json();
                    for (const assignment of data.value) {
                        if (!userIds.includes(assignment.PrincipalId)) {
                            const deleteUrl = `${roleAssignmentsUrl}/removeroleassignment(principalid=${assignment.PrincipalId})`;

                            const deleteResponse = await context.spHttpClient.post(
                                deleteUrl,
                                SPHttpClient.configurations.v1,
                                {
                                    headers: {
                                        Accept: "application/json;odata=nometadata", // Consistent header value
                                        "Content-Type": "application/json;odata=nometadata",
                                    },
                                }
                            );

                            if (!deleteResponse.ok) {
                                console.error('Failed to remove role assignment:', assignment.PrincipalId);
                            }
                        }
                    }
                } else {
                    console.error('Failed to fetch role assignments:', response.statusText);
                }
            }).catch((err: any) => {
                console.log(err);
            });


    } catch (error) {
        console.error('Error in removeAllPermissions:', error);
    }
};

export const breakRoleInheritanceForLib = async (context: WebPartContext, libName: string, userIds: any[]) => {

    const breakInheritanceUrl = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${libName}')/breakroleinheritance(true)`;
    return await context.spHttpClient.post(
        breakInheritanceUrl,
        SPHttpClient.configurations.v1,
        {
            headers: {
                Accept: 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
            },
        }
    ).then(async (response: SPHttpClientResponse) => {
        if (response.ok) {
            await grantPermissionsForLib(context, libName, [...userIds]);
            return await removeAllPermissionsForLib(context, libName, [...userIds]);
        }
    });

};


const removeAllPermissionsForLib = async (context: WebPartContext, libName: string, userIds: number[]) => {
    const roleAssignmentsUrl = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getByTitle('${libName}')/roleassignments`;

    try {
        return await context.spHttpClient.get(roleAssignmentsUrl,
            SPHttpClient.configurations.v1,
            {
                headers: {
                    'Accept': 'application/json;odata=nometadata',
                    'odata-version': ''
                }
            }).then(async (response: SPHttpClientResponse) => {
                if (response.ok) {
                    const data = await response.json();
                    for (const assignment of data.value) {
                        if (!userIds.includes(assignment.PrincipalId)) {
                            const deleteUrl = `${roleAssignmentsUrl}/removeroleassignment(principalid=${assignment.PrincipalId})`;

                            const deleteResponse = await context.spHttpClient.post(
                                deleteUrl,
                                SPHttpClient.configurations.v1,
                                {
                                    headers: {
                                        Accept: "application/json;odata=nometadata", // Consistent header value
                                        "Content-Type": "application/json;odata=nometadata",
                                    },
                                }
                            );

                            if (!deleteResponse.ok) {
                                console.error('Failed to remove role assignment:', assignment.PrincipalId);
                            }
                        }
                    }
                } else {
                    console.error('Failed to fetch role assignments:', response.statusText);
                }
            }).catch((err: any) => {
                console.log(err);
            });


    } catch (error) {
        console.error('Error in removeAllPermissions:', error);
    }
};

export const grantPermissionsForLib = async (context: WebPartContext, libName: string, userIds: any[]) => {
    try {
        for (const userId of userIds) {
            const permissionType = userId.Type === "User" ? 1073741827 : 1073741829;

            const permissionUrl = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${libName}')/roleassignments/addroleassignment(principalid=${userId.IDs},roleDefId=${permissionType})`;
            const response = await context.spHttpClient.post(
                permissionUrl,
                SPHttpClient.configurations.v1,
                {
                    headers: {
                        Accept: 'application/json;odata=verbose',
                        'Content-Type': 'application/json;odata=verbose',
                    },
                }
            );

            if (!response.ok) {
                console.error('Failed to grant permission for user ID:', userId);
            }
        }
    } catch (error) {
        console.error(error);
    }
};