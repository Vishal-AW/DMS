import * as React from 'react';
import ReactTable from 'react-table-6';
import 'react-table-6/react-table.css';
export interface IReusableDataTableComponentProps {
    PagedefaultSize?: number;
    TableRows?: number;
    Tablecolumns?: any;
    Tabledata?: any;
    TableshowPagination?: boolean;
    TableshowFilter?: boolean;
    TableClassName?: string;

}


const ReusableDataTable: React.FC<IReusableDataTableComponentProps> = ({

    PagedefaultSize,
    TableRows,
    Tablecolumns,
    Tabledata,
    TableshowPagination,
    TableshowFilter,
    TableClassName
}) => {

    return (
        <ReactTable
            defaultPageSize={PagedefaultSize ? PagedefaultSize : 0}
            minRows={TableRows}
            columns={Tablecolumns}
            data={Tabledata}
            showPagination={TableshowPagination}
            className={TableClassName ? TableClassName : ''}
            filterable={TableshowFilter}
            defaultFilterMethod={({ filter, row, column }: any) => {
                const id = filter.pivotId || filter.id;
                return (
                    row[id] !== undefined &&
                    row[id] !== null &&
                    row[id] !== '' &&
                    (row[id] as string)
                        .toLocaleLowerCase()
                        .includes(filter.value.toLocaleLowerCase())
                );
            }}
        />
    );
};

export default ReusableDataTable;