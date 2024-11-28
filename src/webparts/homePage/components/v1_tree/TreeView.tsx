import * as React from 'react';
import { useState } from 'react';
import { Icon } from 'office-ui-fabric-react'; // Import icons from Office UI Fabric
import styles from './TreeView.module.scss'

interface TreeNode {
    name: string;
    children?: TreeNode[];
}

interface TreeViewProps {
    onNodeSelect: (nodeName: string) => void;
}

const treeData: TreeNode[] = [
    {
        name: 'Leasing Department',
        children: [
            { name: 'Demo Nexus Mall' },
            {
                name: 'Nexus Ahmedabad One',
                children: [
                    { name: 'Documents Tracker' },
                    { name: 'Floor Plan' },
                    {
                        name: 'Kiosk Storage and Service Agreements',
                        children: [
                            {
                                name: 'Kiosks',
                                children: [
                                    { name: 'BATA' },
                                    { name: 'Brillare' },
                                    { name: 'Reebok' },
                                    { name: 'Tommy Kids' },

                                ],
                            },
                            { name: 'Service' },
                            { name: 'Storage' },

                        ],


                    },
                    { name: 'Retail' },
                ],
            },
            { name: 'Nexus Amritsar' },
            { name: 'Nexus Hyderabad' },
            { name: 'Nexus Indore Central' },
            { name: 'Nexus Mall Koramangala' },
            { name: 'Nexus Seawood' },
            { name: 'Nexus Select CityWalk Delhi' },
            { name: 'Nexus Shantiniketan' },
            { name: 'Nexus Vijaya Complex' },
        ],
    },
];

const TreeView: React.FC<TreeViewProps> = ({ onNodeSelect }) => {
    const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

    const toggleNode = (nodeName: string) => {
        if (expandedNodes.includes(nodeName)) {
            setExpandedNodes(expandedNodes.filter(name => name !== nodeName));
        } else {
            setExpandedNodes([...expandedNodes, nodeName]);
        }
    };

    const renderTree = (nodes: TreeNode[]) => {
        return nodes.map(node => (
            <li key={node.name}>
                <div className={styles['tree-node']}>
                    <span onClick={() => toggleNode(node.name)} style={{ cursor: 'pointer' }}>
                        {/* {node.children && ( */}
                        <Icon
                            iconName={



                                expandedNodes.includes(node.name)
                                    ? 'FabricOpenFolderHorizontal'
                                    : 'FabricFolderFill'


                            }
                            className={styles['folder-icon']}
                            style={{ marginRight: '5px', color: '#0162e8' }}
                        />
                        {/* )} */}
                        {/* {node.children && (
                            <button className="toggle-button">
                                {expandedNodes.includes(node.name) ? '-' : '+'}
                            </button>
                        )} */}
                        <span
                            className={styles['node-name']}
                            onClick={() => onNodeSelect(node.name)}
                        >
                            {node.name}
                        </span>
                    </span>
                </div>
                {node.children && expandedNodes.includes(node.name) && (
                    <ul className="nested-list">{renderTree(node.children)}</ul>
                )}
            </li>
        ));
    };

    return <ul className={styles['tree-view']}>{renderTree(treeData)}</ul>;
};

export default TreeView;
