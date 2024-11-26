import * as React from 'react';
import TreeView from './TreeView'; // Adjust the import according to your file structure
import ReactTableComponent from '../ResuableComponents/ReactTableComponent';
import { IStackItemStyles, IStackStyles, IStackTokens, Stack } from 'office-ui-fabric-react';

const ParentComponent: React.FC = () => {

    const columns = [
        { Header: 'Sr. No.', accessor: 'srNo' },
        { Header: 'Name', accessor: 'name' },
        { Header: 'Uploaded On', accessor: 'uploadedOn' },
        { Header: 'Reference No', accessor: 'referenceNo' },
        { Header: 'Version', accessor: 'version' },
        { Header: 'Status', accessor: 'status' },
        { Header: 'OCR Status', accessor: 'ocrStatus' },
    ];

    const data = [
        {
            srNo: 1,
            name: 'DMS_User Manual_AW1.pdf',
            uploadedOn: '05-08-2024 18:17',
            referenceNo: '2024-00191',
            version: '1.0',
            status: 'Published',
            ocrStatus: 'Completed',
        },
    ];

    // Callback function to handle the selected tree node
    const handleNodeSelection = (nodeName: string) => {
        console.log('Selected Node:', nodeName);
        // You can now use the nodeName in any way you'd like
    };

    const stackStyles: IStackStyles = { root: { height: "100vh" } };
    const stackItemStyles: IStackItemStyles = {
        root: {
            padding: 10,
            border: "1px solid #ddd",
            overflow: "auto",
            background: "#fff",
            boxShadow: "0 10px 30px 0 rgba(82, 63, 105, .05)"
        },
    };
    const stackTokens: IStackTokens = { childrenGap: 10 };
    return (
        // <div className="parent-container">
        //     <div className="col-md-3">
        //         <TreeView onNodeSelect={handleNodeSelection} />
        //     </div>
        //     <div className="col-md-9">
        //         <ReactTableComponent
        //             tableClassName="ReactTables"
        //             columns={columns}
        //             data={data}
        //             defaultPageSize={10}
        //             minRows={1}
        //             showPagination={data.length > 10}
        //             showFilter={true}
        //         />
        //     </div>
        // </div>

        // <div className="ms-Grid" dir="ltr">
        // <div className="ms-Grid-row">
        // <div className="ms-Grid-col ms-sm6 ms-md4 ms-lg4">
        // <TreeView onNodeSelect={handleNodeSelection} />
        // </div>
        // <div className="ms-Grid-col ms-sm6 ms-md8 ms-lg8">
        // <ReactTableComponent
        //                     tableClassName="ReactTables"
        //                     columns={columns}
        //                     data={data}
        //                     defaultPageSize={10}
        //                     minRows={1}
        //                     showPagination={data.length > 10}
        //                     showFilter={true}
        //                 />
        // </div>
        // </div>
        // </div>

        <>
            <div>
                <Stack horizontal styles={stackStyles} tokens={stackTokens}>
                    {/* Tree View Section */}
                    <Stack.Item grow={2} styles={stackItemStyles}>
                        <TreeView onNodeSelect={handleNodeSelection} />
                    </Stack.Item>
                    <Stack.Item grow={3} styles={stackItemStyles}>
                        <ReactTableComponent
                            tableClassName="ReactTables"
                            columns={columns}
                            data={data}
                            defaultPageSize={10}
                            minRows={1}
                            showPagination={data.length > 10}
                            showFilter={true}
                        />
                    </Stack.Item>
                </Stack>
            </div>
        </>
    );
};

export default ParentComponent;
